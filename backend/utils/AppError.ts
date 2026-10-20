/** An error that is safe to show to the client, with the HTTP status to respond with. */
export class AppError extends Error {
	readonly statusCode: number;
	readonly details: Record<string, string[] | undefined> | undefined;

	constructor(statusCode: number, message: string, details?: Record<string, string[] | undefined>) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
		this.details = details;
	}
}
