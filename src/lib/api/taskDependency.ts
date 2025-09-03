import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskDependency } from '$lib/server/db/schema';

type DB = any;

export async function addTaskDependency(
	db: DB,
	params: { taskId: string; dependsOnTaskId: string }
): Promise<TaskDependency> {
	const newDependency = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	} as TaskDependency;
	const [dep] = await db.insert(table.taskDependency).values(newDependency).returning();
	return dep;
}

export async function removeTaskDependency(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskDependency).where(eq(table.taskDependency.id, params.id));
}

export async function listTaskDependencies(
	db: DB,
	params: { taskId: string }
): Promise<TaskDependency[]> {
	return db
		.select()
		.from(table.taskDependency)
		.where(eq(table.taskDependency.taskId, params.taskId));
}
