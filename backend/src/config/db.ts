import mongoose from "mongoose";

import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`MongoDB connection failed: ${message}`);
    throw error;
  }
};
