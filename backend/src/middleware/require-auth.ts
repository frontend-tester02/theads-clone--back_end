import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error.js';
import { verifyAccessToken } from '../utils/token.js';

const ACCESS_TOKEN_COOKIE = 'access_token';

/**
 * Protects a route by requiring a valid access-token cookie.
 * Reads the `access_token` cookie set at login, verifies it, and populates
 * `req.user`. Throws `401` when the token is missing or invalid.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  if (!token) {
    throw new HttpError(401, 'Not authenticated');
  }

  let payload: { sub: string };
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, 'Invalid token');
  }

  req.user = { id: payload.sub };
  next();
}
