import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormError from "../components/FormError";
import PrimaryButton from "../components/PrimaryButton";
import { getErrorMessage } from "../lib/api";
import { useClearAuthErrors } from "../hooks/useClearAuthErrors";
import { useAuthStore } from "../store/authStore";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_S = 60;
const emptyCode = (): string[] => Array.from({ length: CODE_LENGTH }, () => "");

const EmailVerificationPage = () => {
	const [code, setCode] = useState<string[]>(emptyCode);
	const [cooldown, setCooldown] = useState(0);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const lastSubmitted = useRef<string | null>(null);
	const navigate = useNavigate();

	const { user, error, isLoading, verifyEmail, resendVerification } = useAuthStore();

	useClearAuthErrors();

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => {
			setCooldown((s) => s - 1);
		}, 1000);
		return () => {
			clearTimeout(timer);
		};
	}, [cooldown]);

	const focusInput = (index: number) => {
		inputRefs.current[Math.max(0, Math.min(index, CODE_LENGTH - 1))]?.focus();
	};

	const submit = useCallback(
		async (verificationCode: string) => {
			lastSubmitted.current = verificationCode;
			try {
				await verifyEmail(verificationCode);
				toast.success("Email verified successfully");
				void navigate("/");
			} catch {
				setCode(emptyCode());
				focusInput(0);
			}
		},
		[verifyEmail, navigate],
	);

	// Auto-submit once every digit is filled (only once per distinct code).
	useEffect(() => {
		const joined = code.join("");
		if (joined.length === CODE_LENGTH && joined !== lastSubmitted.current && !isLoading) {
			void submit(joined);
		}
	}, [code, isLoading, submit]);

	const handleChange = (index: number, value: string) => {
		const digits = value.replace(/\D/g, "");
		if (digits.length > 1) {
			applyDigits(index, digits);
			return;
		}
		const next = [...code];
		next[index] = digits;
		setCode(next);
		if (digits && index < CODE_LENGTH - 1) focusInput(index + 1);
	};

	const applyDigits = (start: number, digits: string) => {
		const next = [...code];
		for (let i = 0; i < digits.length && start + i < CODE_LENGTH; i++) {
			next[start + i] = digits.charAt(i);
		}
		setCode(next);
		focusInput(Math.min(start + digits.length, CODE_LENGTH - 1));
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		applyDigits(0, e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH));
	};

	const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) focusInput(index - 1);
		if (e.key === "ArrowLeft") focusInput(index - 1);
		if (e.key === "ArrowRight") focusInput(index + 1);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		void submit(code.join(""));
	};

	const handleResend = async () => {
		try {
			toast.success(await resendVerification());
			setCooldown(RESEND_COOLDOWN_S);
			lastSubmitted.current = null;
		} catch (err) {
			toast.error(getErrorMessage(err, "Could not send a new code"));
		}
	};

	return (
		<AuthCard title='Verify Your Email'>
			<p className='text-center text-gray-300 mb-6'>
				Enter the 6-digit code sent to {user?.email ? <strong>{user.email}</strong> : "your email address"}.
			</p>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='flex justify-between gap-2'>
					{code.map((digit, index) => (
						<input
							key={index}
							ref={(el) => {
								inputRefs.current[index] = el;
							}}
							type='text'
							inputMode='numeric'
							autoComplete={index === 0 ? "one-time-code" : "off"}
							aria-label={`Digit ${index + 1}`}
							maxLength={CODE_LENGTH}
							value={digit}
							onChange={(e) => {
								handleChange(index, e.target.value);
							}}
							onKeyDown={(e) => {
								handleKeyDown(index, e);
							}}
							onPaste={handlePaste}
							className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
						/>
					))}
				</div>
				<FormError message={error} />
				<PrimaryButton isLoading={isLoading} disabled={isLoading || code.some((d) => !d)}>
					Verify Email
				</PrimaryButton>
			</form>

			<p className='mt-6 text-center text-sm text-gray-400'>
				Didn&apos;t get the code?{" "}
				<button
					type='button'
					onClick={() => void handleResend()}
					disabled={cooldown > 0 || isLoading}
					className='text-green-400 hover:underline disabled:text-gray-500 disabled:no-underline'
				>
					{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
				</button>
			</p>
		</AuthCard>
	);
};

export default EmailVerificationPage;
