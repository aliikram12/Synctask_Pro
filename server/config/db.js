const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Copy server/.env.example to server/.env and set your MongoDB connection string.'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.message?.includes('ECONNREFUSED') || error.name === 'MongooseServerSelectionError') {
      throw new Error(
        `Cannot connect to MongoDB at ${uri}\n` +
          '→ Run: cd server && npm run db:start   (or start MongoDB Windows service)'
      );
    }
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
