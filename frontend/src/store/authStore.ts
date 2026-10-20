import { create } from "zustand";

import { authApi, getErrorMessage } from "../lib/api";
import type { User } from "../types/auth";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isCheckingAuth: boolean;
	isLoading: boolean;
	error: string | null;
	message: string | null;
}

interface AuthActions {
	signup: (email: string, password: string, name: string) => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	verifyEmail: (code: string) => Promise<void>;
	resendVerification: () => Promise<string>;
	checkAuth: () => Promise<void>;
	forgotPassword: (email: string) => Promise<void>;
	resetPassword: (token: string, password: string) => Promise<void>;
	clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => {
	/**
	 * Runs an API call with shared loading/error handling.
	 * On failure the error message is stored and the error is re-thrown so pages can react.
	 */
	const run = async <T>(action: () => Promise<T>, fallbackError: string): Promise<T> => {
		set({ isLoading: true, error: null, message: null });
		try {
			const result = await action();
			set({ isLoading: false });
			return result;
		} catch (error) {
			set({ isLoading: false, error: getErrorMessage(error, fallbackError) });
			throw error;
		}
	};

	return {
		user: null,
		isAuthenticated: false,
		isCheckingAuth: true,
		isLoading: false,
		error: null,
		message: null,

		signup: async (email, password, name) => {
			const { user, message } = await run(() => authApi.signup({ email, password, name }), "Error signing up");
			set({ user, isAuthenticated: true, message: message ?? null });
		},

		login: async (email, password) => {
			const { user } = await run(() => authApi.login({ email, password }), "Error logging in");
			set({ user, isAuthenticated: true });
		},

		logout: async () => {
			await run(() => authApi.logout(), "Error logging out");
			set({ user: null, isAuthenticated: false });
		},

		verifyEmail: async (code) => {
			const { user } = await run(() => authApi.verifyEmail(code), "Error verifying email");
			set({ user, isAuthenticated: true });
		},

		resendVerification: async () => {
			const { message } = await run(() => authApi.resendVerification(), "Error sending a new code");
			return message ?? "A new code has been sent.";
		},

		checkAuth: async () => {
			set({ isCheckingAuth: true, error: null });
			try {
				const { user } = await authApi.checkAuth();
				set({ user, isAuthenticated: true, isCheckingAuth: false });
			} catch {
				set({ user: null, isAuthenticated: false, isCheckingAuth: false });
			}
		},

		forgotPassword: async (email) => {
			const { message } = await run(() => authApi.forgotPassword(email), "Error sending reset password email");
			set({ message: message ?? null });
		},

		resetPassword: async (token, password) => {
			const { message } = await run(() => authApi.resetPassword(token, password), "Error resetting password");
			set({ message: message ?? null });
		},

		clearError: () => {
			set({ error: null, message: null });
		},
	};
});
