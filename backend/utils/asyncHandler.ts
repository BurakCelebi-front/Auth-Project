import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

/**
 * Wraps an async route handler so rejected promises reach the error middleware
 * (Express 4 does not do this on its own).
 */
export const asyncHandler =
	<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown>(
		handler: (req: Request<P, ResBody, ReqBody>, res: Response<ResBody>, next: NextFunction) => Promise<void>,
	): RequestHandler<P, ResBody, ReqBody> =>
	(req, res, next) => {
		handler(req, res, next).catch(next);
	};
