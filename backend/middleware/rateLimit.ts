import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const message = { success: false, message: "Too many requests, please try again later." };
const skip = () => env.NODE_ENV === "test";

/** Brute-force protection for login, signup, verification and password reset. */
export const authLimiter = rateLimit({
	windowMs: WINDOW_MS,
	limit: 20,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message,
	skip,
});

/** Stricter limit for endpoints that send email. */
export const emailLimiter = rateLimit({
	windowMs: WINDOW_MS,
	limit: 5,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message,
	skip,
});
