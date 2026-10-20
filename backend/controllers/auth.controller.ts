import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";

import { clientUrl } from "../config/env.js";
import { trySendEmail } from "../mail/brevo.js";
import { passwordResetEmail, passwordResetSuccessEmail, verificationEmail, welcomeEmail } from "../mail/templates.js";
import { User, toPublicUser } from "../models/user.model.js";
import type { ApiResponse, UserResponse } from "../types/api.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import {
	MAX_VERIFICATION_ATTEMPTS,
	RESET_TOKEN_TTL_MS,
	VERIFICATION_CODE_TTL_MS,
	generateResetToken,
	generateVerificationCode,
	hashToken,
} from "../utils/tokens.js";
import type {
	ForgotPasswordInput,
	LoginInput,
	ResetPasswordInput,
	ResetTokenParams,
	SignupInput,
	VerifyEmailInput,
} from "../validation/auth.schemas.js";

type Params = Record<string, string>;

// Compared against when the email is unknown, so login takes the same time either way
// and response timing does not reveal which emails are registered.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("timing-attack-dummy-password", 12);

const requireUserId = (userId: string | undefined): string => {
	if (!userId) throw new AppError(401, "Unauthorized");
	return userId;
};

export const signup = asyncHandler<Params, UserResponse, SignupInput>(async (req, res) => {
	const { name, email, password } = req.body;

	if (await User.exists({ email })) {
		throw new AppError(409, "User already exists");
	}

	const code = generateVerificationCode();
	const user = await User.create({
		name,
		email,
		password,
		verificationToken: hashToken(code),
		verificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
	});

	setAuthCookie(res, user.id);
	const emailSent = await trySendEmail({ to: user.email, ...verificationEmail(code) });

	res.status(201).json({
		success: true,
		message: emailSent
			? "Account created. Check your email for the verification code."
			: "Account created, but we couldn't send the verification email. Please request a new code.",
		user: toPublicUser(user),
	});
});

export const verifyEmail = asyncHandler<Params, UserResponse, VerifyEmailInput>(async (req, res) => {
	const user = await User.findById(requireUserId(req.userId)).select(
		"+verificationToken +verificationTokenExpiresAt +verificationAttempts",
	);

	if (!user) throw new AppError(404, "User not found");
	if (user.isVerified) throw new AppError(400, "Email is already verified");

	if (!user.verificationToken || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
		throw new AppError(400, "Verification code has expired. Please request a new one.");
	}

	if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
		throw new AppError(429, "Too many incorrect attempts. Please request a new code.");
	}

	if (user.verificationToken !== hashToken(req.body.code)) {
		user.verificationAttempts += 1;
		await user.save();
		throw new AppError(400, "Invalid verification code");
	}

	user.isVerified = true;
	user.verificationToken = undefined;
	user.verificationTokenExpiresAt = undefined;
	user.verificationAttempts = 0;
	await user.save();

	void trySendEmail({ to: user.email, ...welcomeEmail(user.name) });

	res.json({ success: true, message: "Email verified successfully", user: toPublicUser(user) });
});

export const resendVerification = asyncHandler<Params, ApiResponse>(async (req, res) => {
	const user = await User.findById(requireUserId(req.userId));

	if (!user) throw new AppError(404, "User not found");
	if (user.isVerified) throw new AppError(400, "Email is already verified");

	const code = generateVerificationCode();
	user.verificationToken = hashToken(code);
	user.verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
	user.verificationAttempts = 0;
	await user.save();

	if (!(await trySendEmail({ to: user.email, ...verificationEmail(code) }))) {
		throw new AppError(502, "Could not send the verification email. Please try again later.");
	}

	res.json({ success: true, message: "A new verification code has been sent to your email." });
});

export const login = asyncHandler<Params, UserResponse, LoginInput>(async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select("+password");

	const passwordMatches = user
		? await user.comparePassword(password)
		: await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

	if (!user || !passwordMatches) {
		throw new AppError(401, "Invalid email or password");
	}

	user.lastLogin = new Date();
	await user.save();
	setAuthCookie(res, user.id);

	res.json({ success: true, message: "Logged in successfully", user: toPublicUser(user) });
});

export const logout: RequestHandler<Params, ApiResponse> = (_req, res) => {
	clearAuthCookie(res);
	res.json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = asyncHandler<Params, ApiResponse, ForgotPasswordInput>(async (req, res) => {
	const user = await User.findOne({ email: req.body.email });

	// Same response whether or not the account exists, so the endpoint can't be used to discover emails.
	if (user) {
		const { token, hashedToken } = generateResetToken();
		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
		await user.save();

		await trySendEmail({ to: user.email, ...passwordResetEmail(`${clientUrl}/reset-password/${token}`) });
	}

	res.json({ success: true, message: "If an account exists for this email, a reset link has been sent." });
});

export const resetPassword = asyncHandler<ResetTokenParams, ApiResponse, ResetPasswordInput>(async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: hashToken(req.params.token),
		resetPasswordExpiresAt: { $gt: new Date() },
	}).select("+password");

	if (!user) throw new AppError(400, "Invalid or expired reset link");

	user.password = req.body.password; // hashed by the pre-save hook
	user.resetPasswordToken = undefined;
	user.resetPasswordExpiresAt = undefined;
	await user.save();

	void trySendEmail({ to: user.email, ...passwordResetSuccessEmail() });

	res.json({ success: true, message: "Password reset successful" });
});

export const checkAuth = asyncHandler<Params, UserResponse>(async (req, res) => {
	const user = await User.findById(requireUserId(req.userId));

	if (!user) {
		clearAuthCookie(res);
		throw new AppError(401, "User not found");
	}

	res.json({ success: true, user: toPublicUser(user) });
});
