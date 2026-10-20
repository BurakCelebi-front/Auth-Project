import { describe, expect, it } from "vitest";

import { loginSchema, resetTokenParamsSchema, signupSchema, verifyEmailSchema } from "../validation/auth.schemas.js";

describe("signupSchema", () => {
	it("normalises email and trims name", () => {
		const result = signupSchema.parse({ name: "  Ada  ", email: "  Ada@Example.COM ", password: "secret123" });
		expect(result).toEqual({ name: "Ada", email: "ada@example.com", password: "secret123" });
	});

	it.each([
		["too short", "a1"],
		["no number", "onlyletters"],
		["no letter", "12345678"],
		["longer than bcrypt's 72 bytes", `a1${"x".repeat(80)}`],
	])("rejects a weak password (%s)", (_label, password) => {
		expect(signupSchema.safeParse({ name: "Ada", email: "ada@example.com", password }).success).toBe(false);
	});

	it("rejects an invalid email", () => {
		expect(signupSchema.safeParse({ name: "Ada", email: "not-an-email", password: "secret123" }).success).toBe(false);
	});
});

describe("other schemas", () => {
	it("requires a 6-digit code", () => {
		expect(verifyEmailSchema.safeParse({ code: "123456" }).success).toBe(true);
		expect(verifyEmailSchema.safeParse({ code: "12345" }).success).toBe(false);
		expect(verifyEmailSchema.safeParse({ code: "12345a" }).success).toBe(false);
	});

	it("accepts any non-empty password on login", () => {
		expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
		expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
	});

	it("only accepts well-formed reset tokens", () => {
		expect(resetTokenParamsSchema.safeParse({ token: "a".repeat(64) }).success).toBe(true);
		expect(resetTokenParamsSchema.safeParse({ token: "../../etc" }).success).toBe(false);
	});
});
