import { Check, X } from "lucide-react";

import { getPasswordCriteria, getPasswordStrength } from "../lib/password";

interface PasswordStrengthMeterProps {
	password: string;
}

const STRENGTH_LABELS = ["Very Weak", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_COLORS = ["bg-red-500", "bg-red-400", "bg-yellow-500", "bg-yellow-400", "bg-green-500"] as const;

const PasswordCriteria = ({ password }: PasswordStrengthMeterProps) => (
	<ul className='mt-2 space-y-1'>
		{getPasswordCriteria(password).map((item) => (
			<li key={item.label} className='flex items-center text-xs'>
				{item.met ? (
					<Check className='size-4 text-green-500 mr-2' aria-hidden='true' />
				) : (
					<X className='size-4 text-gray-500 mr-2' aria-hidden='true' />
				)}
				<span className={item.met ? "text-green-500" : "text-gray-400"}>
					{item.label}
					{!item.required && <span className='text-gray-500'> (recommended)</span>}
				</span>
			</li>
		))}
	</ul>
);

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
	const strength = getPasswordStrength(password);

	return (
		<div className='mt-2'>
			<div className='flex justify-between items-center mb-1'>
				<span className='text-xs text-gray-400'>Password strength</span>
				<span className='text-xs text-gray-400'>{STRENGTH_LABELS[strength]}</span>
			</div>

			<div className='flex space-x-1' aria-hidden='true'>
				{[0, 1, 2, 3].map((index) => (
					<div
						key={index}
						className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${
							index < strength ? STRENGTH_COLORS[strength] : "bg-gray-600"
						}`}
					/>
				))}
			</div>
			<PasswordCriteria password={password} />
		</div>
	);
};

export default PasswordStrengthMeter;
