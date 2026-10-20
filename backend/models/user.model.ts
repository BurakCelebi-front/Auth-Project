import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type Model } from "mongoose";

const BCRYPT_ROUNDS = 12;

export interface IUser {
	email: string;
	password: string;
	name: string;
	lastLogin: Date;
	isVerified: boolean;
	verificationToken?: string | undefined;
	verificationTokenExpiresAt?: Date | undefined;
	verificationAttempts: number;
	resetPasswordToken?: string | undefined;
	resetPasswordExpiresAt?: Date | undefined;
	createdAt: Date;
	updatedAt: Date;
}

interface IUserMethods {
	comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

/** Fields stripped from `toJSON()` as a safety net; API responses use `toPublicUser` (an allow-list). */
const PRIVATE_FIELDS = [
	"password",
	"verificationToken",
	"verificationTokenExpiresAt",
	"verificationAttempts",
	"resetPasswordToken",
	"resetPasswordExpiresAt",
	"__v",
] as const;

/** The user object as returned by the API. */
export interface PublicUser {
	_id: string;
	name: string;
	email: string;
	isVerified: boolean;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		// `select: false` keeps secrets out of query results unless explicitly requested with `.select("+field")`.
		password: { type: String, required: true, select: false },
		name: { type: String, required: true, trim: true },
		lastLogin: { type: Date, default: Date.now },
		isVerified: { type: Boolean, default: false },
		verificationToken: { type: String, select: false },
		verificationTokenExpiresAt: { type: Date, select: false },
		verificationAttempts: { type: Number, default: 0, select: false },
		resetPasswordToken: { type: String, select: false },
		resetPasswordExpiresAt: { type: Date, select: false },
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc, ret: Record<string, unknown>) => {
				for (const field of PRIVATE_FIELDS) delete ret[field];
				return ret;
			},
		},
	},
);

userSchema.pre("save", async function hashPassword() {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

userSchema.method("comparePassword", function comparePassword(this: UserDocument, candidate: string) {
	return bcrypt.compare(candidate, this.password);
});

export const User = model<IUser, UserModel>("User", userSchema);

/** Allow-list of fields that are safe to send to the client. */
export const toPublicUser = (user: UserDocument): PublicUser => ({
	_id: user.id,
	name: user.name,
	email: user.email,
	isVerified: user.isVerified,
	lastLogin: user.lastLogin,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});
