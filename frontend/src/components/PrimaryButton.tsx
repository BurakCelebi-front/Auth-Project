import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader } from "lucide-react";

interface PrimaryButtonProps extends HTMLMotionProps<"button"> {
	isLoading?: boolean;
	children: React.ReactNode;
}

const PrimaryButton = ({ isLoading = false, disabled, className, children, ...props }: PrimaryButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.02 }}
		whileTap={{ scale: 0.98 }}
		type='submit'
		disabled={disabled ?? isLoading}
		aria-busy={isLoading}
		className={`w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
		{...props}
	>
		{isLoading ? <Loader className='size-6 animate-spin mx-auto' aria-label='Loading' /> : children}
	</motion.button>
);

export default PrimaryButton;
