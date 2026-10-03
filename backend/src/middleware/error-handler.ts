import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error.js';

/**
 * Detects a MongoDB duplicate-key error (unique index violation).
 * Happens on concurrent requests with the same username/email.
 */
function isDuplicateKeyError(error: unknown): error is { code: number; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

/**
 * Central error-handler that maps every error to a single
 * `{ error: { message, details? } }` shape. Express 5 forwards rejected
 * promises from async handlers here.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'The submitted data is invalid.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (isDuplicateKeyError(error)) {
    const field = Object.keys(error.keyPattern ?? {})[0];
    const label = field === 'email' ? 'Email' : 'Username';
    res.status(409).json({
      error: { message: `${label} is already taken.` },
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }

  console.error('Unexpected error:', error);
  res.status(500).json({ error: { message: 'Internal server error.' } });
}
