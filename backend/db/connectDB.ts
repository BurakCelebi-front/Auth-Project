import mongoose from "mongoose";

import { env } from "../config/env.js";

export const connectDB = async (uri: string = env.MONGO_URI): Promise<void> => {
	mongoose.set("strictQuery", true);
	const conn = await mongoose.connect(uri);
	console.log(`MongoDB connected: ${conn.connection.host}`);
};

export const disconnectDB = (): Promise<void> => mongoose.disconnect();
