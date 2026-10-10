/**
 * Augments Express's `Request` with the authenticated user.
 * Populated by the `requireAuth` middleware after a valid access token is verified.
 */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export {};
