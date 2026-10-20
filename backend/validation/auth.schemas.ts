import { z } from "zod";

const email = z
	.string({ error: "Email is required" })
	.trim()
	.toLowerCase()
	.pipe(z.email("Please enter a valid email address"));

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const newPassword = z
	.string({ error: "Password is required" })
	.min(8, "Password must be at least 8 characters")
	.max(72, "Password must be at most 72 characters")
	.regex(/[a-z]/i, "Password must contain a letter")
	.regex(/\d/, "Password must contain a number");

export const signupSchema = z.object({
	name: z
		.string({ error: "Name is required" })
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be at most 50 characters"),
	email,
	password: newPassword,
});

export const loginSchema = z.object({
	email,
	password: z.string({ error: "Password is required" }).min(1, "Password is required").max(72),
});

export const verifyEmailSchema = z.object({
	code: z.string({ error: "Code is required" }).regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({ password: newPassword });

export const resetTokenParamsSchema = z.object({
	token: z.string().regex(/^[a-f0-9]{64}$/, "Invalid or expired reset link"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetTokenParams = z.infer<typeof resetTokenParamsSchema>;
