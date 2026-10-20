import { randomUUID } from "node:crypto";

import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../db/connectDB.js";
import { trySendEmail, type EmailMessage } from "../mail/brevo.js";
import { User } from "../models/user.model.js";

vi.mock("../mail/brevo.js", () => ({
	sendEmail: vi.fn(),
	trySendEmail: vi.fn(async () => true),
}));

const sentEmails = vi.mocked(trySendEmail);
const app = createApp();

const lastEmailTo = (to: string): EmailMessage => {
	const call = sentEmails.mock.calls.filter(([message]) => message.to === to).at(-1);
	if (!call) throw new Error(`No email sent to ${to}`);
	return call[0];
};
const codeFrom = (message: EmailMessage): string => message.text.match(/\b(\d{6})\b/)?.[1] ?? "";
const resetTokenFrom = (message: EmailMessage): string =>
	message.text.match(/reset-password\/([a-f0-9]{64})/)?.[1] ?? "";

const PASSWORD = "secret123";
const newUser = () => ({ name: "Ada Lovelace", email: `ada-${randomUUID()}@example.com`, password: PASSWORD });

beforeAll(async () => {
	const base = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017";
	await connectDB(`${base.replace(/\/+$/, "")}/auth_test_${Date.now()}`);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await disconnectDB();
});

beforeEach(() => {
	sentEmails.mockClear();
});

describe("general", () => {
	it("responds to the health check", async () => {
		await request(app).get("/api/health").expect(200, { status: "ok" });
	});

	it("returns JSON 404 for unknown API routes", async () => {
		const res = await request(app).get("/api/nope").expect(404);
		expect(res.body).toMatchObject({ success: false });
	});

	it("returns 400 for malformed JSON", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.set("content-type", "application/json")
			.send("{bad json")
			.expect(400);
		expect(res.body.message).toMatch(/malformed json/i);
	});

	it("sets security headers", async () => {
		const res = await request(app).get("/api/health");
		expect(res.headers["x-powered-by"]).toBeUndefined();
		expect(res.headers["x-content-type-options"]).toBe("nosniff");
	});
});

describe("signup", () => {
	it("creates a user, sets an httpOnly cookie and never leaks secrets", async () => {
		const input = newUser();
		const res = await request(app).post("/api/auth/signup").send(input).expect(201);

		expect(res.body.user).toMatchObject({ name: input.name, email: input.email, isVerified: false });
		for (const secret of ["password", "verificationToken", "verificationTokenExpiresAt", "resetPasswordToken"]) {
			expect(res.body.user).not.toHaveProperty(secret);
		}
		expect(res.headers["set-cookie"]?.[0]).toMatch(/token=.+HttpOnly/i);

		const stored = await User.findOne({ email: input.email }).select("+password +verificationToken").lean();
		expect(stored?.password).not.toBe(PASSWORD); // hashed
		expect(stored?.verificationToken).not.toBe(codeFrom(lastEmailTo(input.email))); // hashed
	});

	it("normalises the email so case does not create duplicates", async () => {
		const input = newUser();
		await request(app).post("/api/auth/signup").send(input).expect(201);
		const res = await request(app)
			.post("/api/auth/signup")
			.send({ ...input, email: input.email.toUpperCase() })
			.expect(409);
		expect(res.body.message).toBe("User already exists");
	});

	it("returns field errors for invalid input", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({ name: "A", email: "nope", password: "short" })
			.expect(400);
		expect(res.body.errors).toHaveProperty("email");
		expect(res.body.errors).toHaveProperty("password");
		expect(res.body.errors).toHaveProperty("name");
	});
});

describe("email verification", () => {
	it("requires authentication", async () => {
		await request(app).post("/api/auth/verify-email").send({ code: "123456" }).expect(401);
	});

	it("rejects a wrong code, then accepts the right one", async () => {
		const agent = request.agent(app);
		const input = newUser();
		await agent.post("/api/auth/signup").send(input).expect(201);
		const code = codeFrom(lastEmailTo(input.email));
		const wrong = code === "000000" ? "111111" : "000000";

		await agent.post("/api/auth/verify-email").send({ code: wrong }).expect(400);
		const res = await agent.post("/api/auth/verify-email").send({ code }).expect(200);
		expect(res.body.user.isVerified).toBe(true);

		await agent.post("/api/auth/verify-email").send({ code }).expect(400); // already verified
	});

	it("locks the code after too many wrong attempts until a new one is requested", async () => {
		const agent = request.agent(app);
		const input = newUser();
		await agent.post("/api/auth/signup").send(input).expect(201);
		const code = codeFrom(lastEmailTo(input.email));
		const wrong = code === "000000" ? "111111" : "000000";

		for (let i = 0; i < 5; i++) await agent.post("/api/auth/verify-email").send({ code: wrong }).expect(400);
		await agent.post("/api/auth/verify-email").send({ code }).expect(429);

		await agent.post("/api/auth/resend-verification").expect(200);
		const newCode = codeFrom(lastEmailTo(input.email));
		await agent.post("/api/auth/verify-email").send({ code: newCode }).expect(200);
	});
});

describe("login / check-auth / logout", () => {
	it("logs in, reads the session and logs out", async () => {
		const input = newUser();
		await request(app).post("/api/auth/signup").send(input).expect(201);

		const agent = request.agent(app);
		const login = await agent
			.post("/api/auth/login")
			.send({ email: input.email.toUpperCase(), password: PASSWORD })
			.expect(200);
		expect(login.body.user.email).toBe(input.email);
		expect(login.body.user).not.toHaveProperty("password");

		const me = await agent.get("/api/auth/check-auth").expect(200);
		expect(me.body.user.email).toBe(input.email);

		await agent.post("/api/auth/logout").expect(200);
		await agent.get("/api/auth/check-auth").expect(401);
	});

	it("gives the same error for a wrong password and an unknown email", async () => {
		const input = newUser();
		await request(app).post("/api/auth/signup").send(input).expect(201);

		const wrongPassword = await request(app)
			.post("/api/auth/login")
			.send({ email: input.email, password: "wrong-password1" })
			.expect(401);
		const unknownEmail = await request(app)
			.post("/api/auth/login")
			.send({ email: "nobody@example.com", password: "whatever1" })
			.expect(401);
		expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
	});

	it("rejects a tampered token", async () => {
		await request(app).get("/api/auth/check-auth").set("Cookie", "token=not.a.jwt").expect(401);
	});
});

describe("password reset", () => {
	it("does not reveal whether an email is registered", async () => {
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "nobody@example.com" })
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(sentEmails).not.toHaveBeenCalled();
	});

	it("resets the password with a one-time link", async () => {
		const input = newUser();
		await request(app).post("/api/auth/signup").send(input).expect(201);

		await request(app).post("/api/auth/forgot-password").send({ email: input.email }).expect(200);
		const token = resetTokenFrom(lastEmailTo(input.email));
		expect(token).toHaveLength(64);

		const newPassword = "brandNew456";
		await request(app).post(`/api/auth/reset-password/${token}`).send({ password: newPassword }).expect(200);

		await request(app).post("/api/auth/login").send({ email: input.email, password: PASSWORD }).expect(401);
		await request(app).post("/api/auth/login").send({ email: input.email, password: newPassword }).expect(200);

		// the link only works once
		await request(app).post(`/api/auth/reset-password/${token}`).send({ password: "another789" }).expect(400);
	});

	it("rejects malformed reset tokens before touching the database", async () => {
		await request(app).post("/api/auth/reset-password/abc").send({ password: "secret123" }).expect(400);
	});
});
