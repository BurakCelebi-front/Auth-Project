import type { ErrorRequestHandler, RequestHandler } from "express";

import type { ErrorResponse } from "../types/api.js";
import { AppError } from "../utils/AppError.js";

export const notFound: RequestHandler = (req, _res, next) => {
	next(new AppError(404, `Not found - ${req.method} ${req.originalUrl}`));
};

const isDuplicateKeyError = (err: unknown): boolean =>
	typeof err === "object" && err !== null && "code" in err && err.code === 11000;

const isMalformedJson = (err: unknown): boolean =>
	err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed";

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
	let body: ErrorResponse;
	let status: number;

	if (err instanceof AppError) {
		status = err.statusCode;
		body = { success: false, message: err.message, ...(err.details && { errors: err.details }) };
	} else if (isMalformedJson(err)) {
		status = 400;
		body = { success: false, message: "Malformed JSON in request body" };
	} else if (isDuplicateKeyError(err)) {
		status = 409;
		body = { success: false, message: "User already exists" };
	} else {
		console.error("Unhandled error:", err);
		status = 500;
		body = { success: false, message: "Internal server error" };
	}

	res.status(status).json(body);
};
