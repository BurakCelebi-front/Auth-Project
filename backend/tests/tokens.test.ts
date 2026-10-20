import { describe, expect, it } from "vitest";

import { generateResetToken, generateVerificationCode, hashToken } from "../utils/tokens.js";

describe("tokens", () => {
	it("generates 6-digit verification codes", () => {
		for (let i = 0; i < 200; i++) {
			expect(generateVerificationCode()).toMatch(/^\d{6}$/);
		}
	});

	it("generates a 64-char hex reset token with its sha256 hash", () => {
		const { token, hashedToken } = generateResetToken();
		expect(token).toMatch(/^[a-f0-9]{64}$/);
		expect(hashedToken).toBe(hashToken(token));
		expect(hashedToken).not.toBe(token);
	});

	it("hashes deterministically", () => {
		expect(hashToken("abc")).toBe(hashToken("abc"));
		expect(hashToken("abc")).not.toBe(hashToken("abd"));
	});
});
