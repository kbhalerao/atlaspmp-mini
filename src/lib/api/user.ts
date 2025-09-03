import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { User } from '$lib/server/db/schema';
import { hash } from 'bcryptjs';

type DB = any;

/**
 * Hashes a password using bcrypt.
 * @param newPassword The password to hash.
 * @returns The hashed password.
 */
export async function hashPassword(newPassword: string): Promise<string> {
	const saltRounds = 10;
	return await hash(newPassword, saltRounds);
}

export async function getUserById(db: DB, params: { id: string }): Promise<User | null> {
	const [user] = await db.select().from(table.user).where(eq(table.user.id, params.id));
	return user ?? null;
}

export async function listUsers(db: DB): Promise<User[]> {
	return db.select().from(table.user);
}

export async function getUserByUsername(
	db: DB,
	params: { username: string }
): Promise<User | null> {
	const [user] = await db.select().from(table.user).where(eq(table.user.username, params.username));
	return user ?? null;
}

/**
 * Creates new user. Adds a unique ID and created / modified timestamps.
 * Fails if there is a user with the same username.
 * @param db
 * @param userData
 * @returns
 */
export async function createUser(db: DB, userData: Partial<User>): Promise<User | null> {
	// Set default values for missing fields
	const newUser = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...userData
	};
	const [user] = await db.insert(table.user).values(newUser).returning();
	return user ?? null;
}

/**
 * Get or Create User
 */
export async function getOrCreateUser(db: DB, userData: Partial<User>): Promise<User | null> {
	if (!userData.username) {
		throw new Error('Username is required to get or create a user.');
	}
	const existingUser = await getUserByUsername(db, { username: userData.username });
	if (existingUser) {
		return existingUser;
	}
	return createUser(db, userData);
}

/**
 * Update Password, make sure you send in a hashed password
 */
export async function updateUserPassword(
	db: DB,
	params: { id: string; newHashPassword: string }
): Promise<void> {
	const user = await getUserById(db, { id: params.id });
	if (!user) {
		throw new Error('User not found');
	}
	user.passwordHash = params.newHashPassword;
	user.updatedAt = new Date();
	await db.update(table.user).set(user).where(eq(table.user.id, params.id));
}
