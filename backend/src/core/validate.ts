import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

type AnyShape = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    } satisfies AnyShape);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params as any;
    if (result.data.query) req.query = result.data.query as any;

    return next();
  };
};
