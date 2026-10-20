import axios, { isAxiosError } from "axios";

import type { ApiResponse, ErrorResponse, UserResponse } from "../types/auth";

const http = axios.create({
	baseURL: "/api/auth",
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});

/** Extracts a user-facing message from any thrown value. */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
	if (isAxiosError<ErrorResponse>(error)) {
		if (error.response?.data.message) return error.response.data.message;
		if (!error.response) return "Network error - please check your connection";
	}
	return fallback;
};

/** Typed client for every auth endpoint. */
export const authApi = {
	signup: (body: { name: string; email: string; password: string }) =>
		http.post<UserResponse>("/signup", body).then((r) => r.data),
	login: (body: { email: string; password: string }) => http.post<UserResponse>("/login", body).then((r) => r.data),
	logout: () => http.post<ApiResponse>("/logout").then((r) => r.data),
	verifyEmail: (code: string) => http.post<UserResponse>("/verify-email", { code }).then((r) => r.data),
	resendVerification: () => http.post<ApiResponse>("/resend-verification").then((r) => r.data),
	checkAuth: () => http.get<UserResponse>("/check-auth").then((r) => r.data),
	forgotPassword: (email: string) => http.post<ApiResponse>("/forgot-password", { email }).then((r) => r.data),
	resetPassword: (token: string, password: string) =>
		http.post<ApiResponse>(`/reset-password/${encodeURIComponent(token)}`, { password }).then((r) => r.data),
};
