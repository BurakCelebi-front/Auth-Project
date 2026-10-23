import { Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormError from "../components/FormError";
import Input from "../components/Input";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PrimaryButton from "../components/PrimaryButton";
import { PASSWORD_MAX_LENGTH, isPasswordValid } from "../lib/password";
import { useClearAuthErrors } from "../hooks/useClearAuthErrors";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	useClearAuthErrors();

	const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await signup(email, password, name);
			const { message } = useAuthStore.getState();
			if (message) toast.success(message);
			void navigate("/verify-email");
		} catch {
			// error message is shown from the store
		}
	};

	return (
		<AuthCard
			title='Create Account'
			footer={
				<p className='text-sm text-gray-400'>
					Already have an account?{" "}
					<Link to='/login' className='text-green-400 hover:underline'>
						Login
					</Link>
				</p>
			}
		>
			<form onSubmit={(e) => void handleSignUp(e)} noValidate>
				<Input
					icon={User}
					type='text'
					placeholder='Full Name'
					autoComplete='name'
					value={name}
					onChange={(e) => {
						setName(e.target.value);
					}}
					required
					minLength={2}
					maxLength={50}
				/>
				<Input
					icon={Mail}
					type='email'
					placeholder='Email Address'
					autoComplete='email'
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					required
				/>
				<Input
					icon={Lock}
					type='password'
					placeholder='Password'
					autoComplete='new-password'
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					required
					maxLength={PASSWORD_MAX_LENGTH}
				/>
				<FormError message={error} />
				<PasswordStrengthMeter password={password} />

				<PrimaryButton
					className='mt-5'
					isLoading={isLoading}
					disabled={isLoading || !name.trim() || !email.trim() || !isPasswordValid(password)}
				>
					Sign Up
				</PrimaryButton>
			</form>
		</AuthCard>
	);
};

export default SignUpPage;
