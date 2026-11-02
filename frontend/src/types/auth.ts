/** User as returned by the API (see backend `toPublicUser`). Dates arrive as ISO strings. */
export interface User {
	_id: string;
	name: string;
	email: string;
	isVerified: boolean;
	lastLogin: string;
	createdAt: string;
	updatedAt: string;
}

export interface ApiResponse {
	success: boolean;
	message?: string;
}

export interface UserResponse extends ApiResponse {
	user: User;
}

/** `user` is `null` when nobody is logged in. */
export interface SessionResponse extends ApiResponse {
	user: User | null;
}

export interface ErrorResponse extends ApiResponse {
	success: false;
	message: string;
	errors?: Record<string, string[] | undefined>;
}
