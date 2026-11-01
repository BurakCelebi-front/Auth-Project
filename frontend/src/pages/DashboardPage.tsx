import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import FormError from "../components/FormError";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useClearAuthErrors } from "../hooks/useClearAuthErrors";
import { useAuthStore } from "../store/authStore";
import { formatDate, formatDay } from "../utils/date";

const DashboardPage = () => {
	const { user, logout, deleteAccount, isLoading, error, clearError } = useAuthStore();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [password, setPassword] = useState("");
	useClearAuthErrors();
	// ProtectedRoute guarantees a user; this guard keeps the types honest.
	if (!user) return null;

	const handleLogout = async () => {
		try {
			await logout();
		} catch {
			toast.error("Error logging out");
		}
	};

	const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await deleteAccount(password);
			toast.success("Your account has been deleted");
		} catch {
			// The error message is shown in the form via the store.
		}
	};

	const closeDelete = () => {
		setIsDeleteOpen(false);
		setPassword("");
		clearError();
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
		>
			<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text'>
				Dashboard
			</h2>

			<div className='space-y-6'>
				<motion.section
					className='p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<h3 className='text-xl font-semibold text-green-400 mb-3'>Profile Information</h3>
					<p className='text-gray-300'>Name: {user.name}</p>
					<p className='text-gray-300'>Email: {user.email}</p>
				</motion.section>
				<motion.section
					className='p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<h3 className='text-xl font-semibold text-green-400 mb-3'>Account Activity</h3>
					<p className='text-gray-300'>
						<span className='font-bold'>Joined: </span>
						{formatDay(user.createdAt)}
					</p>
					<p className='text-gray-300'>
						<span className='font-bold'>Last Login: </span>
						{formatDate(user.lastLogin)}
					</p>
				</motion.section>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className='mt-4'
			>
				<PrimaryButton type='button' onClick={() => void handleLogout()} isLoading={isLoading}>
					Logout
				</PrimaryButton>
			</motion.div>
						<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
				className='mt-6 p-4 rounded-lg border border-red-900 bg-red-950 bg-opacity-30'
			>
				<h3 className='text-xl font-semibold text-red-400 mb-2'>Danger Zone</h3>
				{isDeleteOpen ? (
					<form onSubmit={(e) => void handleDeleteAccount(e)}>
						<p className='text-gray-300 text-sm mb-4'>
							This permanently deletes your account and all its data. Enter your password to confirm.
						</p>
						<Input
							icon={Lock}
							type='password'
							placeholder='Current password'
							autoComplete='current-password'
							value={password}
							onChange={(e) => { setPassword(e.target.value); }}
							required
						/>
						<FormError message={error} />
						<div className='flex gap-3'>
							<button
								type='button'
								onClick={closeDelete}
								className='flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 transition duration-200'
							>
								Cancel
							</button>
							<PrimaryButton
								isLoading={isLoading}
								disabled={isLoading || password.length === 0}
								className='flex-1 from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-red-500'
							>
								Delete
							</PrimaryButton>
						</div>
					</form>
				) : (
					<button
						type='button'
						onClick={() => { setIsDeleteOpen(true); }}
						className='w-full py-3 px-4 rounded-lg border border-red-700 text-red-400 font-bold hover:bg-red-900 hover:bg-opacity-30 transition duration-200'
					>
						Delete account
					</button>
				)}
			</motion.section>
		</motion.div>
	);
};

export default DashboardPage;
