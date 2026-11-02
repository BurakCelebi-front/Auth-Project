import type { PublicUser } from "../models/user.model.js";

export interface ApiResponse {
	success: boolean;
	message?: string;
}

export interface UserResponse extends ApiResponse {
	user: PublicUser;
}

/** `user` is `null` for visitors without a valid session. */
export interface SessionResponse extends ApiResponse {
	user: PublicUser | null;
}

export interface ErrorResponse extends ApiResponse {
	success: false;
	message: string;
	errors?: Record<string, string[] | undefined>;
}
