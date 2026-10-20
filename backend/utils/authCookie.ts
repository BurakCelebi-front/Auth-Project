import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

import { env, isProduction } from "../config/env.js";

export const AUTH_COOKIE_NAME = "token";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const baseCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: "strict",
	path: "/",
};

export const signAuthToken = (userId: string): string =>
	jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: TOKEN_TTL_MS / 1000, algorithm: "HS256" });

/** Returns the user id stored in the token, or `null` if the token is invalid or expired. */
export const verifyAuthToken = (token: string): string | null => {
	try {
		const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
		return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
	} catch {
		return null;
	}
};

export const setAuthCookie = (res: Response, userId: string): void => {
	res.cookie(AUTH_COOKIE_NAME, signAuthToken(userId), { ...baseCookieOptions, maxAge: TOKEN_TTL_MS });
};

export const clearAuthCookie = (res: Response): void => {
	res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
};
