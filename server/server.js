require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:', missing.join(', '));
    console.error('   Copy server/.env.example → server/.env and fill in the values.\n');
    process.exit(1);
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
  }
};

const startServer = async () => {
  try {
    validateEnv();

    console.log('Connecting to MongoDB...');
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL
            : 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    require('./sockets/socketHandler')(io);
    app.set('io', io);

    const PORT = process.env.PORT || 5000;

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error('   Stop the other process or set PORT=5001 in .env\n');
      } else {
        console.error('\n❌ Server error:', err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message, '\n');
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

startServer();
