import type { CookieOptions, Request, Response } from 'express'
import { loginSchema, registerSchema } from '../utils/validations.js'
import { loginUser, registerUser } from '../services/auth.service.js'
import { toPublicUser } from '../models/user.model.js'
import { accessTokenMaxAgeMs, signAccessToken } from '../utils/token.js'

const ACCESS_TOKEN_COOKIE = 'access_token'

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

	const cookieOptions: CookieOptions = {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: accessTokenMaxAgeMs(),
	}
	res.cookie(ACCESS_TOKEN_COOKIE, token, cookieOptions)

	res.status(200).json({ data: toPublicUser(user) })
}
