import {
	model,
	Schema,
	type HydratedDocument,
	type InferSchemaType,
} from 'mongoose'

/**
 * User collection schema.
 * The `createdAt` and `updatedAt` fields are managed automatically via `timestamps`.
 * `email` and `username` are trimmed and lowercased before storage, so the unique
 * index works regardless of letter case.
 */
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			minlength: 3,
			maxlength: 30,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		displayName: {
			type: String,
			required: true,
			trim: true,
			maxlength: 50,
		},
		bio: {
			type: String,
			default: '',
			trim: true,
			maxlength: 160,
		},
		avatarUrl: {
			type: String,
			default: '',
			trim: true,
		},
		isPrivate: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

export type User = InferSchemaType<typeof userSchema>
export type UserDocument = HydratedDocument<User>

/**
 * The user object exposed to the outside.
 * `passwordHash` is never included here.
 */
export interface PublicUser {
	id: string
	username: string
	email: string
	displayName: string
	bio: string
	avatarUrl: string
	isPrivate: boolean
	createdAt: Date
}

export function toPublicUser(doc: UserDocument): PublicUser {
	return {
		id: doc.id,
		username: doc.username,
		email: doc.email,
		displayName: doc.displayName,
		bio: doc.bio,
		avatarUrl: doc.avatarUrl,
		isPrivate: doc.isPrivate,
		createdAt: doc.createdAt,
	}
}

export const UserModel = model('User', userSchema)
