import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["backend/tests/**/*.test.ts"],
		environment: "node",
		fileParallelism: false,
		env: {
			NODE_ENV: "test",
			JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
			MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017",
			CLIENT_URL: "http://localhost:5173",
		},
	},
});
