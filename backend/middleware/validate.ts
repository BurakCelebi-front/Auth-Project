import type { RequestHandler } from "express";
import { z } from "zod";

import { AppError } from "../utils/AppError.js";

type Source = "body" | "params";

/**
 * Validates `req.body` (or `req.params`) against a zod schema and replaces it with the parsed,
 * normalised value (e.g. trimmed + lower-cased email). Responds 400 with per-field errors otherwise.
 */
export const validate =
	(schema: z.ZodType, source: Source = "body"): RequestHandler =>
	(req, _res, next) => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			const { fieldErrors } = z.flattenError(result.error);
			const message = result.error.issues[0]?.message ?? "Invalid request";
			next(new AppError(400, message, fieldErrors as Record<string, string[] | undefined>));
			return;
		}

		if (source === "body") req.body = result.data;
		else req.params = result.data as typeof req.params;
		next();
	};
