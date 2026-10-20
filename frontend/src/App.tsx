import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

import FloatingShape from "./components/FloatingShape";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardPage from "./pages/DashboardPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/authStore";

interface RouteGuardProps {
	children: ReactNode;
}

/** Only for logged-in, verified users. */
const ProtectedRoute = ({ children }: RouteGuardProps) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated || !user) return <Navigate to='/login' replace />;
	if (!user.isVerified) return <Navigate to='/verify-email' replace />;
	return children;
};

/** Only for logged-in users who still need to verify their email. */
const UnverifiedRoute = ({ children }: RouteGuardProps) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated || !user) return <Navigate to='/login' replace />;
	if (user.isVerified) return <Navigate to='/' replace />;
	return children;
};

/** Login/signup pages: send verified users to the dashboard, unverified ones to verification. */
const RedirectAuthenticatedUser = ({ children }: RouteGuardProps) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user) return <Navigate to={user.isVerified ? "/" : "/verify-email"} replace />;
	return children;
};

const App = () => {
	const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
	const checkAuth = useAuthStore((s) => s.checkAuth);

	useEffect(() => {
		void checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden p-4'>
			<FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/verify-email'
					element={
						<UnverifiedRoute>
							<EmailVerificationPage />
						</UnverifiedRoute>
					}
				/>
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
};

export default App;
