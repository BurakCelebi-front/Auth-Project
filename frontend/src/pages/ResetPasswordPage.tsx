import { Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormError from "../components/FormError";
import Input from "../components/Input";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PrimaryButton from "../components/PrimaryButton";
import { PASSWORD_MAX_LENGTH, isPasswordValid } from "../lib/password";
import { useAuthStore } from "../store/authStore";

const REDIRECT_DELAY_MS = 2000;

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [mismatch, setMismatch] = useState(false);
	const { resetPassword, error, isLoading, clearError } = useAuthStore();

	const { token = "" } = useParams<{ token: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		clearError();
	}, [clearError]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setMismatch(true);
			return;
		}
		setMismatch(false);

		try {
			await resetPassword(token, password);
			toast.success("Password reset successfully, redirecting to login page...");
			setTimeout(() => {
				navigate("/login");
			}, REDIRECT_DELAY_MS);
		} catch {
			// error message is shown from the store
		}
	};

	return (
		<AuthCard title='Reset Password'>
			<form onSubmit={(e) => void handleSubmit(e)}>
				<Input
					icon={Lock}
					type='password'
					placeholder='New Password'
					autoComplete='new-password'
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					required
					maxLength={PASSWORD_MAX_LENGTH}
				/>
				<Input
					icon={Lock}
					type='password'
					placeholder='Confirm New Password'
					autoComplete='new-password'
					value={confirmPassword}
					onChange={(e) => {
						setConfirmPassword(e.target.value);
					}}
					required
					maxLength={PASSWORD_MAX_LENGTH}
				/>
				<FormError message={mismatch ? "Passwords do not match" : error} />
				<PasswordStrengthMeter password={password} />

				<PrimaryButton
					className='mt-5'
					isLoading={isLoading}
					disabled={isLoading || !isPasswordValid(password) || !confirmPassword}
				>
					Set New Password
				</PrimaryButton>
			</form>
		</AuthCard>
	);
};

export default ResetPasswordPage;
