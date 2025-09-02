import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskAssignee } from '$lib/server/db/schema';

type DB = any;

export async function addTaskAssignee(
	db: DB,
	params: { taskId: string; userId: string }
): Promise<TaskAssignee> {
	const [assignee] = await db.insert(table.taskAssignee).values(params).returning();
	return assignee;
}

export async function removeTaskAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskAssignee).where(eq(table.taskAssignee.id, params.id));
}

export async function listTaskAssignees(
	db: DB,
	params: { taskId: string }
): Promise<TaskAssignee[]> {
	return db.select().from(table.taskAssignee).where(eq(table.taskAssignee.taskId, params.taskId));
}
