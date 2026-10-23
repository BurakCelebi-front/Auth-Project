import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormError from "../components/FormError";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useClearAuthErrors } from "../hooks/useClearAuthErrors";
import { useAuthStore } from "../store/authStore";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { isLoading, error, forgotPassword } = useAuthStore();

	useClearAuthErrors();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await forgotPassword(email);
			setIsSubmitted(true);
		} catch {
			// error message is shown from the store
		}
	};

	return (
		<AuthCard
			title='Forgot Password'
			footer={
				<Link to='/login' className='text-sm text-green-400 hover:underline flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2' aria-hidden='true' /> Back to Login
				</Link>
			}
		>
			{!isSubmitted ? (
				<form onSubmit={(e) => void handleSubmit(e)}>
					<p className='text-gray-300 mb-6 text-center'>
						Enter your email address and we&apos;ll send you a link to reset your password.
					</p>
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
					<FormError message={error} />
					<PrimaryButton isLoading={isLoading}>Send Reset Link</PrimaryButton>
				</form>
			) : (
				<div className='text-center'>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
						className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'
					>
						<Mail className='h-8 w-8 text-white' aria-hidden='true' />
					</motion.div>
					<p className='text-gray-300 mb-6'>
						If an account exists for {email}, you will receive a password reset link shortly.
					</p>
				</div>
			)}
		</AuthCard>
	);
};

export default ForgotPasswordPage;
