import { createHash, randomBytes, randomInt } from "node:crypto";

export const VERIFICATION_CODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const MAX_VERIFICATION_ATTEMPTS = 5;

/** Cryptographically secure 6-digit code, e.g. "042917". */
export const generateVerificationCode = (): string => randomInt(0, 1_000_000).toString().padStart(6, "0");

/** Tokens are stored hashed so a database leak does not expose usable codes or links. */
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const generateResetToken = (): { token: string; hashedToken: string } => {
	const token = randomBytes(32).toString("hex");
	return { token, hashedToken: hashToken(token) };
};
