import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";

import { isProduction } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.route.js";

// Resolves to <repo>/frontend/dist both from backend/ (tsx) and from dist/ (compiled).
const clientDist = fileURLToPath(new URL("../frontend/dist", import.meta.url));

export const createApp = (): Express => {
	const app = express();

	app.disable("x-powered-by");
	if (isProduction) app.set("trust proxy", 1); // behind Render's proxy: needed for correct client IPs in rate limiting

	app.use(helmet());
	app.use(express.json({ limit: "10kb" }));
	app.use(cookieParser());

	app.get("/api/health", (_req, res) => {
		res.json({ status: "ok" });
	});
	app.use("/api/auth", authRoutes);
	app.use("/api", notFound);

	// In production, the same server also serves the built React app.
	if (isProduction) {
		app.use(express.static(clientDist));
		app.get("*", (_req, res) => {
			res.sendFile("index.html", { root: clientDist });
		});
	}

	app.use(notFound);
	app.use(errorHandler);

	return app;
};
