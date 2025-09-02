import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskActivity } from '$lib/server/db/schema';

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
	const [activity] = await db.insert(table.taskActivity).values(params).returning();
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

export async function listTaskActivities(
	db: DB,
	params: { taskId: string }
): Promise<TaskActivity[]> {
	return db.select().from(table.taskActivity).where(eq(table.taskActivity.taskId, params.taskId));
}

export async function deleteTaskActivity(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskActivity).where(eq(table.taskActivity.id, params.id));
}
