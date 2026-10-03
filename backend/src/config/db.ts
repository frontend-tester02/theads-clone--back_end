import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Configure the MongoDB connection string in backend/.env.');
  }

  await mongoose.connect(uri);
}
