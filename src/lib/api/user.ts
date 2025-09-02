import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { User } from '$lib/server/db/schema';

type DB = any;

export async function getUserById(db: DB, params: { id: string }): Promise<User | null> {
	const [user] = await db.select().from(table.user).where(eq(table.user.id, params.id));
	return user ?? null;
}

export async function listUsers(db: DB): Promise<User[]> {
	return db.select().from(table.user);
}
