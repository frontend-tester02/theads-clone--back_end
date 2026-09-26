import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('MONGODB_URI kiritilmagan. backend/.env faylida MongoDB ulanish manzilini sozlang.');
  }

  await mongoose.connect(uri);
}
