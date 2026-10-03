import { z } from 'zod'

/**
 * All Zod validation schemas live in this file.
 * When a new endpoint is added, put its schema here too.
 */

/**
 * Username format: 3–30 characters, only letters, numbers, underscore and dot.
 * Trimmed and lowercased before storage (same as the model).
 */
const usernameSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3, 'Username must be at least 3 characters.')
	.max(30, 'Username must be at most 30 characters.')
	.regex(
		/^[a-z0-9_.]+$/,
		'Username may contain only letters, numbers, underscores (_) and dots (.).',
	)

export const registerSchema = z.object({
	username: usernameSchema,
	email: z.string().trim().toLowerCase().email('Invalid email address.'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.max(72, 'Password must be at most 72 characters.'),
	displayName: z
		.string()
		.trim()
		.min(1, 'Display name must not be empty.')
		.max(50, 'Display name must be at most 50 characters.'),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Login with username + password. Username is trimmed and lowercased to match how
 * it is stored. Password is only required to be present.
 */
export const loginSchema = z.object({
	username: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, 'Username is required.'),
	password: z.string().min(1, 'Password is required.'),
})

export type LoginInput = z.infer<typeof loginSchema>
