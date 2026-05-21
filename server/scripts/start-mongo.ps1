# Start local MongoDB for SyncTask Pro (project data dir — no admin needed)
$mongod = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$dbPath = Join-Path $root "data\mongo"
$logPath = Join-Path $root "data\mongo-log\mongod.log"

if (-not (Test-Path $mongod)) {
  Write-Host "MongoDB not found. Install: https://www.mongodb.com/try/download/community"
  exit 1
}

New-Item -ItemType Directory -Force -Path $dbPath, (Split-Path $logPath) | Out-Null

try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("127.0.0.1", 27017)
  $tcp.Close()
  Write-Host "MongoDB already running on 127.0.0.1:27017"
  node (Join-Path $PSScriptRoot "check-mongo.js")
  exit $LASTEXITCODE
} catch {}

Write-Host "Starting MongoDB at $dbPath ..."
Start-Process -FilePath $mongod -ArgumentList @(
  "--dbpath", "`"$dbPath`"",
  "--logpath", "`"$logPath`"",
  "--bind_ip", "127.0.0.1",
  "--port", "27017"
) -WindowStyle Hidden

Start-Sleep -Seconds 5
node (Join-Path $PSScriptRoot "check-mongo.js")
exit $LASTEXITCODE
