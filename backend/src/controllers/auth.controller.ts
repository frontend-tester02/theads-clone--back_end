import type { CookieOptions, Request, Response } from 'express'
import { loginSchema, registerSchema } from '../utils/validations.js'
import { getMe, loginUser, registerUser } from '../services/auth.service.js'
import { toPublicUser } from '../models/user.model.js'
import { accessTokenMaxAgeMs, signAccessToken } from '../utils/token.js'
import { HttpError } from '../utils/http-error.js'

const ACCESS_TOKEN_COOKIE = 'access_token'

/**
 * Base attributes of the access-token cookie, shared by login (set) and logout
 * (clear). The browser only removes a cookie when these attributes match the
 * ones it was set with, so both paths must use the same values.
 */
const accessCookieOptions: CookieOptions = {
	httpOnly: true,
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production',
	path: '/',
}

/**
 * POST /api/auth/register
 * Validates the request body with Zod and creates a new user.
 * Errors (validation, taken username/email, duplicate-key) are forwarded
 * to the central error-handler.
 */
export async function register(req: Request, res: Response): Promise<void> {
	const input = registerSchema.parse(req.body)
	const user = await registerUser(input)

	res.status(201).json({ data: { user } })
}

/**
 * POST /api/auth/login
 * Verifies credentials, signs a JWT, and sets it as an httpOnly cookie.
 * Never returns the token in the body or exposes `passwordHash`.
 */
export async function login(req: Request, res: Response): Promise<void> {
	const input = loginSchema.parse(req.body)
	const user = await loginUser(input)

	const token = signAccessToken({ sub: user.id })

	res.cookie(ACCESS_TOKEN_COOKIE, token, {
		...accessCookieOptions,
		maxAge: accessTokenMaxAgeMs(),
	})

	res.status(200).json({ data: toPublicUser(user) })
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's public profile. Protected by `requireAuth`,
 * which populates `req.user` from the access-token cookie.
 */
export async function me(req: Request, res: Response): Promise<void> {
	if (!req.user) {
		throw new HttpError(401, 'Not authenticated')
	}

	const user = await getMe(req.user.id)

	res.status(200).json({ data: user })
}

/**
 * POST /api/auth/logout
 * Clears the access-token cookie. Uses the same cookie attributes as login so
 * the browser actually removes it. Protected by `requireAuth`.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
	res.clearCookie(ACCESS_TOKEN_COOKIE, accessCookieOptions)

	res.status(200).json({ data: { message: 'Logged out' } })
}
