import { useLayoutEffect } from "react";

import { useAuthStore } from "../store/authStore";

/**
 * Clears errors/messages left in the shared auth store by the previous page.
 * Runs as a layout effect so a stale error is never painted, not even for one frame.
 */
export const useClearAuthErrors = (): void => {
	const clearError = useAuthStore((s) => s.clearError);

	useLayoutEffect(() => {
		clearError();
	}, [clearError]);
};
