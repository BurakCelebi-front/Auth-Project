import "dotenv/config";
import { z } from "zod";

/** Treats empty strings (e.g. `BREVO_API_KEY=` in .env) as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
	z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z
	.object({
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.coerce.number().int().positive().default(5174),
		MONGO_URI: z.string().min(1, "MONGO_URI is required"),
		JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
		CLIENT_URL: optional(z.url("CLIENT_URL must be a valid URL")),
		BREVO_API_KEY: optional(z.string()),
		EMAIL_FROM: optional(z.email("EMAIL_FROM must be a valid email address")),
		EMAIL_FROM_NAME: z.string().default("Auth App"),
	})
	.superRefine((env, ctx) => {
		if (env.NODE_ENV !== "production") return;
		for (const key of ["CLIENT_URL", "BREVO_API_KEY", "EMAIL_FROM"] as const) {
			if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required in production` });
		}
	});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const clientUrl = (env.CLIENT_URL ?? "http://localhost:5173").replace(/\/+$/, "");
