import { Lock, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormError from "../components/FormError";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, isLoading, error, clearError } = useAuthStore();

	useEffect(() => {
		clearError();
	}, [clearError]);

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await login(email, password);
			// RedirectAuthenticatedUser sends the user on once the store updates
		} catch {
			// error message is shown from the store
		}
	};

	return (
		<AuthCard
			title='Welcome Back'
			footer={
				<p className='text-sm text-gray-400'>
					Don&apos;t have an account?{" "}
					<Link to='/signup' className='text-green-400 hover:underline'>
						Sign up
					</Link>
				</p>
			}
		>
			<form onSubmit={(e) => void handleLogin(e)}>
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
					autoComplete='current-password'
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					required
				/>

				<div className='flex items-center mb-6'>
					<Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
						Forgot password?
					</Link>
				</div>
				<FormError message={error} />

				<PrimaryButton isLoading={isLoading}>Login</PrimaryButton>
			</form>
		</AuthCard>
	);
};

export default LoginPage;
