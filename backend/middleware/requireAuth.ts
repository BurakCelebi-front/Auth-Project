import type { RequestHandler } from "express";

import { AppError } from "../utils/AppError.js";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "../utils/authCookie.js";

/** Rejects the request with 401 unless it carries a valid auth cookie; sets `req.userId`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
	const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];

	if (typeof token !== "string" || token.length === 0) {
		next(new AppError(401, "Unauthorized - no token provided"));
		return;
	}

	const userId = verifyAuthToken(token);
	if (!userId) {
		next(new AppError(401, "Unauthorized - invalid or expired token"));
		return;
	}

	req.userId = userId;
	next();
};
