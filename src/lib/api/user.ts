import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { User } from '$lib/server/db/schema';
import { hash } from 'bcryptjs';
import type { DB } from './atlas';
import type { AiTextGenerationToolInputWithFunction } from '@cloudflare/ai-utils';

/**
 * Hashes a plaintext password using bcrypt. Use before storing user passwords.
 * @param newPassword The password to hash.
 * @returns The hashed password.
 */
export async function hashPassword(newPassword: string): Promise<string> {
	const saltRounds = 10;
	return await hash(newPassword, saltRounds);
}

/**
 * Fetch a user by their unique ID.
 * @param db The database connection.
 * @param params Object with user id.
 * @returns The user if found, or null.
 */
export async function getUserById(db: DB, params: { id: string }): Promise<User | null> {
	const [user] = await db.select().from(table.user).where(eq(table.user.id, params.id));
	return user ?? null;
}

function createGetUserByIDTool(db: DB): AiTextGenerationToolInputWithFunction {
	return {
		name: 'getUserByID',
		description: 'Fetch a user by their unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					description: 'The unique ID of the user to fetch.'
				}
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			const user = await getUserById(db, { id: args.id });
			return JSON.stringify(user ?? {});
		}
	};
}

/**
 * List all users in the system.
 * @param db The database connection.
 * @returns Array of users.
 */
export async function listUsers(db: DB): Promise<User[]> {
	return db.select().from(table.user);
}

function createListUsersTool(db: DB): AiTextGenerationToolInputWithFunction {
	return {
		name: 'listUsers',
		description: 'List all users in the system.',
		parameters: {
			type: 'object',
			properties: {},
			required: []
		},
		function: async (args: {}) => {
			const users = await listUsers(db);
			return JSON.stringify(users);
		}
	};
}

/**
 * Fetch a user by their unique username.
 * @param db The database connection.
 * @param params Object with username.
			// const users = await listUsers(db);
			return JSON.stringify({ message: 'This is a test', db });
		}
	};
}

/**
 * Fetch a user by their unique username.
 * @param db The database connection.
 * @param params Object with username.
 * @returns The user if found, or null.
 */
export async function getUserByUsername(
	db: DB,
	params: { username: string }
): Promise<User | null> {
	const [user] = await db.select().from(table.user).where(eq(table.user.username, params.username));
	return user ?? null;
}

function createGetUserByUsernameTool(db: DB): AiTextGenerationToolInputWithFunction {
	return {
		name: 'getUserByUsername',
		description: 'Fetch a user by their unique username.',
		parameters: {
			type: 'object',
			properties: {
				username: {
					type: 'string',
					description: 'The unique username of the user to fetch.'
				}
			},
			required: ['username']
		},
		function: async (args: { username: string }) => {
			const user = await getUserByUsername(db, { username: args.username });
			return JSON.stringify(user ?? {});
		}
	};
}

/**
 * Create a new user. Generates a unique ID and timestamps. Fails if username is not unique.
 * @param db The database connection.
 * @param userData Partial user object (must include username and passwordHash).
 * @returns The created user, or null if creation failed.
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

function createCreateUserTool(db: DB): AiTextGenerationToolInputWithFunction {
	return {
		name: 'createUser',
		description: 'Create a new user with a unique ID and timestamps.',
		parameters: {
			type: 'object',
			properties: {
				username: {
					type: 'string',
					description: 'The unique username for the new user.'
				},
				passwordHash: {
					type: 'string',
					description: 'The hashed password for the new user.'
				}
			},
			required: ['username', 'passwordHash']
		},
		function: async (args: { username: string; passwordHash: string }) => {
			const user = await createUser(db, {
				username: args.username,
				passwordHash: args.passwordHash
			});
			return JSON.stringify(user ?? {});
		}
	};
}

/**
 * Fetch a user by username, or create if not found.
 * @param db The database connection.
 * @param userData Partial user object (must include username).
 * @returns The found or created user, or null if creation failed.
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

function createGetOrCreateUserTool(db: DB): AiTextGenerationToolInputWithFunction {
	return {
		name: 'getOrCreateUser',
		description: 'Fetch a user by username, or create if not found.',
		parameters: {
			type: 'object',
			properties: {
				username: {
					type: 'string',
					description: 'The unique username for the user.'
				},
				passwordHash: {
					type: 'string',
					description: 'The hashed password for the user (required if creating).'
				}
			},
			required: ['username']
		},
		function: async (args: { username: string; passwordHash?: string }) => {
			const user = await getOrCreateUser(db, {
				username: args.username,
				passwordHash: args.passwordHash
			});
			return JSON.stringify(user ?? {});
		}
	};
}

export const userTools = (db: DB) => [
	createGetUserByIDTool(db),
	createListUsersTool(db),
	createGetUserByUsernameTool(db),
	createCreateUserTool(db),
	createGetOrCreateUserTool(db)
];

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
