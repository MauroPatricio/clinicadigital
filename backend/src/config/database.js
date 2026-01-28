import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer needs useNewUrlParser, useUnifiedTopology, etc.
    });

    console.log('\x1b[32m%s\x1b[0m', '✓ MongoDB conectado com sucesso!');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '✗ Falha ao conectar com MongoDB');
    logger.error(`MongoDB Connection Error: ${error.message}`);
    throw error; // Throw instead of exit to allow graceful handling
  }
};

export default connectDB;
