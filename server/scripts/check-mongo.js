/**
 * Quick MongoDB connection test — run: node scripts/check-mongo.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/synctask-pro';

async function main() {
  console.log('Testing:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('\nFix: Start MongoDB service (Windows):');
    console.error('   net start MongoDB');
    console.error('   Or: Services → MongoDB Server → Start\n');
    process.exit(1);
  }
}

main();
