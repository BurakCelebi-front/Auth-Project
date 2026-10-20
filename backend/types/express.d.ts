declare global {
	namespace Express {
		interface Request {
			/** Set by the `requireAuth` middleware after the JWT is verified. */
			userId?: string;
		}
	}
}

export {};
