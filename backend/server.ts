import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./db/connectDB.js";

try {
	await connectDB();
} catch (error) {
	console.error("Error connecting to MongoDB:", error instanceof Error ? error.message : error);
	process.exit(1);
}

const server = createApp().listen(env.PORT, () => {
	console.log(`Server is running on port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: NodeJS.Signals): void => {
	console.log(`${signal} received, shutting down...`);
	server.close(() => {
		void disconnectDB().finally(() => process.exit(0));
	});
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
