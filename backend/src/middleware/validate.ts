/**
 * validateBody — zod request body validator emitting RFC7807 problem+json.
 *
 * Usage:
 *   router.post('/foo', validateBody(FooCreateSchema), handler)
 *
 * On failure: 400, content-type `application/problem+json`, body:
 *   { type, title, status, detail, errors: [{ path, message }] }
 *
 * Strips unknown fields (zod `.strict()` is up to the caller — we default to
 * pass-through to avoid breaking existing clients; opt in to strict per schema).
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export interface ValidationProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors: Array<{ path: string; message: string }>;
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .type('application/problem+json')
        .json(problemFromZod(parsed.error, 'Invalid request body'));
    }
    // Replace req.body with the validated/coerced value
    (req as any).body = parsed.data;
    return next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .type('application/problem+json')
        .json(problemFromZod(parsed.error, 'Invalid query string'));
    }
    (req as any).query = parsed.data;
    return next();
  };
}

function problemFromZod(err: ZodError, title: string): ValidationProblem {
  return {
    type: 'https://harvics.dev/errors/validation',
    title,
    status: 400,
    detail: 'One or more fields failed validation. See errors[] for details.',
    errors: err.issues.map((i) => ({
      path: i.path.join('.') || '(root)',
      message: i.message,
    })),
  };
}
