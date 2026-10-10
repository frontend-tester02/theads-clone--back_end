import jwt, { type SignOptions } from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN = '7d';

export interface AccessTokenPayload {
  sub: string;
}

/**
 * Signs a JWT access token with `{ sub: userId }`.
 * Reads `JWT_SECRET` (required) and `JWT_EXPIRES_IN` (default "7d") from the env.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN) as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

/**
 * Verifies a JWT access token and returns its `{ sub }` payload.
 * Reads `JWT_SECRET` (required) from the env. Throws when the token is invalid,
 * expired, or missing the expected `sub` claim.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== 'object' || typeof decoded.sub !== 'string') {
    throw new Error('Token payload is missing the "sub" claim.');
  }

  return { sub: decoded.sub };
}

/**
 * Converts `JWT_EXPIRES_IN` into milliseconds so a cookie's `maxAge` matches the
 * token's lifetime. Accepts a bare number (seconds, per the JWT convention) or a
 * string like "7d", "12h", "30m", "60s".
 */
export function accessTokenMaxAgeMs(): number {
  const raw = (process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN).trim();

  const asSeconds = Number(raw);
  if (!Number.isNaN(asSeconds)) {
    return asSeconds * 1000;
  }

  const match = /^(\d+)(s|m|h|d)$/i.exec(raw);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN value: "${raw}". Use e.g. "7d", "12h", or seconds like "3600".`);
  }

  const value = Number(match[1]);
  const unitMs: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[match[2].toLowerCase()];
}
