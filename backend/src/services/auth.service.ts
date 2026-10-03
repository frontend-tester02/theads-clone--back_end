import bcrypt from 'bcryptjs';
import { toPublicUser, UserModel, type PublicUser, type UserDocument } from '../models/user.model.js';
import { HttpError } from '../utils/http-error.js';
import type { LoginInput, RegisterInput } from '../utils/validations.js';

const SALT_ROUNDS = 12;

/**
 * Registers a new user.
 * The password is never stored in plain text — only its bcrypt hash is saved.
 * Taken username/email is checked upfront; in a race condition (concurrent
 * requests) the MongoDB duplicate-key error becomes a 409 in the error-handler.
 */
export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const { username, email, password, displayName } = input;

  const existing = await UserModel.findOne({ $or: [{ username }, { email }] })
    .select('username email')
    .lean();

  if (existing) {
    const field = existing.email === email ? 'Email' : 'Username';
    throw new HttpError(409, `${field} is already taken.`);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await UserModel.create({
    username,
    email,
    passwordHash,
    displayName,
  });

  return toPublicUser(user);
}

/**
 * Authenticates a user by username plus password.
 * Returns the same 401 whether the account is missing or the password is wrong,
 * so a caller cannot tell which field was incorrect.
 */
export async function loginUser(input: LoginInput): Promise<UserDocument> {
  const { username, password } = input;

  const user = await UserModel.findOne({ username });

  if (!user) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  return user;
}
