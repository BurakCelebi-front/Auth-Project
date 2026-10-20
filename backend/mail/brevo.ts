import { env } from "../config/env.js";
import type { EmailContent } from "./templates.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 10_000;

export interface EmailMessage extends EmailContent {
	to: string;
}

/**
 * Sends a transactional email through the Brevo HTTP API.
 * HTTP is used instead of SMTP because many free hosts (e.g. Render) block outbound SMTP ports.
 *
 * Without Brevo credentials in development, the email is printed to the console instead,
 * so the whole flow can be tried locally without an email provider.
 */
export const sendEmail = async ({ to, subject, html, text }: EmailMessage): Promise<void> => {
	if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
		if (env.NODE_ENV === "production") throw new Error("Email is not configured");
		console.info(`\n[email:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
		return;
	}

	const response = await fetch(BREVO_API_URL, {
		method: "POST",
		headers: {
			"api-key": env.BREVO_API_KEY,
			"content-type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify({
			sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
			to: [{ email: to }],
			subject,
			htmlContent: html,
			textContent: text,
		}),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`Brevo API error ${response.status}: ${await response.text()}`);
	}
};

/** Sends an email without letting a delivery failure break the request. Returns whether it was sent. */
export const trySendEmail = async (message: EmailMessage): Promise<boolean> => {
	try {
		await sendEmail(message);
		return true;
	} catch (error) {
		console.error(`Failed to send "${message.subject}" email:`, error instanceof Error ? error.message : error);
		return false;
	}
};
