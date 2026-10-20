import { Router } from "express";

import {
	checkAuth,
	forgotPassword,
	login,
	logout,
	resendVerification,
	resetPassword,
	signup,
	verifyEmail,
} from "../controllers/auth.controller.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	resetTokenParamsSchema,
	signupSchema,
	verifyEmailSchema,
} from "../validation/auth.schemas.js";

const router = Router();

router.get("/check-auth", requireAuth, checkAuth);

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

router.post("/verify-email", authLimiter, requireAuth, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", emailLimiter, requireAuth, resendVerification);

router.post("/forgot-password", emailLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post(
	"/reset-password/:token",
	authLimiter,
	validate(resetTokenParamsSchema, "params"),
	validate(resetPasswordSchema),
	resetPassword,
);

export default router;
