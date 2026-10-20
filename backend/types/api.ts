import type { PublicUser } from "../models/user.model.js";

export interface ApiResponse {
	success: boolean;
	message?: string;
}

export interface UserResponse extends ApiResponse {
	user: PublicUser;
}

export interface ErrorResponse extends ApiResponse {
	success: false;
	message: string;
	errors?: Record<string, string[] | undefined>;
}
