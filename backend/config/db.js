const mongoose = require('mongoose');

// CRITICAL: Global plugin to convert _id → id in ALL models
// Without this, frontend code expecting .id would break (MongoDB uses _id)
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    },
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    },
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

