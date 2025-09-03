import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskActivity } from '$lib/server/db/schema';
import { id } from 'zod/v4/locales';

type DB = any;

export async function createTaskActivity(
	db: DB,
	params: {
		taskId: string;
		userId: string;
		action: string;
		llmContext: string;
		timestamp: number;
	}
): Promise<TaskActivity> {
	const newTaskActivity = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	};
	const [activity] = await db.insert(table.taskActivity).values(newTaskActivity).returning();
	return activity;
}

export async function getTaskActivityById(
	db: DB,
	params: { id: string }
): Promise<TaskActivity | null> {
	const [activity] = await db
		.select()
		.from(table.taskActivity)
		.where(eq(table.taskActivity.id, params.id));
	return activity ?? null;
}


/**
 * Lists all activities for a specific task, filter by any combination of userId, projectId or taskId. Ordered by most recently modified first,
 * and paginated by limit and offset.
 * @param db The database connection.
 * @param params The parameters containing the task ID. Accepts userId, projectId, and taskId, limit (default 10) and offset (default 0).
 * @returns A list of task activities.
 */

export async function listTaskActivities(
	db: DB,
	params: { taskId?: string; userId?: string; projectId?: string; limit?: number; offset?: number }
): Promise<TaskActivity[]> {
	let query = db.select().from(table.taskActivity)
		.innerJoin(table.task, eq(table.taskActivity.taskId, table.task.id))
		.innerJoin(table.user, eq(table.taskActivity.userId, table.user.id))
		.innerJoin(table.project, eq(table.task.projectId, table.project.id))
		.orderBy(table.taskActivity.updatedAt, 'desc');
	if (params.taskId) {
		query = query.where(eq(table.task.id, params.taskId));
	}
	if (params.userId) {
		query = query.where(eq(table.user.id, params.userId));
	}
	if (params.projectId) {
		query = query.where(eq(table.project.id, params.projectId));
	}
	return query.limit(params.limit ?? 10).offset(params.offset ?? 0);
}

export async function deleteTaskActivity(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskActivity).where(eq(table.taskActivity.id, params.id));
}
