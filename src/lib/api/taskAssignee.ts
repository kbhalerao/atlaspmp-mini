import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskAssignee } from '$lib/server/db/schema';

type DB = any;

/**
 * Assign a user to a task.
 * @param db The database connection.
 * @param params Object with taskId and userId.
 * @returns The created task assignee.
 */
export async function addTaskAssignee(
	db: DB,
	params: { taskId: string; userId: string }
): Promise<TaskAssignee> {
	const newAssignee: TaskAssignee = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	};
	const [assignee] = await db.insert(table.taskAssignee).values(newAssignee).returning();
	return assignee;
}

/**
 * Remove a user from a task by assignment ID.
 * @param db The database connection.
 * @param params Object with assignment id.
 * @returns A promise that resolves when the assignee is removed.
 */
export async function removeTaskAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskAssignee).where(eq(table.taskAssignee.id, params.id));
}

/**
 * List all users assigned to a task.
 * @param db The database connection.
 * @param params Object with taskId.
 * @returns Array of task assignees.
 */
export async function listTaskAssignees(
	db: DB,
	params: { taskId: string }
): Promise<TaskAssignee[]> {
	return db.select().from(table.taskAssignee).where(eq(table.taskAssignee.taskId, params.taskId));
}
