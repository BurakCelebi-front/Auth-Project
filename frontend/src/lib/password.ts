/** Mirrors the backend password rules (backend/validation/auth.schemas.ts). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export interface PasswordCriterion {
	label: string;
	met: boolean;
	required: boolean;
}

export const getPasswordCriteria = (password: string): PasswordCriterion[] => [
	{ label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: password.length >= PASSWORD_MIN_LENGTH, required: true },
	{ label: "Contains a letter", met: /[a-z]/i.test(password), required: true },
	{ label: "Contains a number", met: /\d/.test(password), required: true },
	{ label: "Upper and lowercase letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password), required: false },
	{ label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password), required: false },
];

export const isPasswordValid = (password: string): boolean =>
	password.length <= PASSWORD_MAX_LENGTH && getPasswordCriteria(password).every((c) => !c.required || c.met);

/** 0-4 score used by the strength meter. */
export const getPasswordStrength = (password: string): 0 | 1 | 2 | 3 | 4 => {
	let score = 0;
	if (password.length >= PASSWORD_MIN_LENGTH) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return score as 0 | 1 | 2 | 3 | 4;
};
