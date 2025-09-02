import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Task } from '$lib/server/db/schema';

type DB = any;

export async function createTask(
	db: DB,
	params: {
		title: string;
		priority: number;
		status: string;
		createdAt: number;
		updatedAt: number;
		deadline: number;
		description: string;
		llmContext: string;
		projectId: string;
	}
): Promise<Task> {
	const [task] = await db.insert(table.task).values(params).returning();
	return task;
}

export async function getTaskById(db: DB, params: { id: string }): Promise<Task | null> {
	const [task] = await db.select().from(table.task).where(eq(table.task.id, params.id));
	return task ?? null;
}

export async function updateTask(
	db: DB,
	params: {
		id: string;
		title?: string;
		priority?: number;
		status?: string;
		updatedAt?: number;
		deadline?: number;
		description?: string;
		llmContext?: string;
		projectId?: string;
	}
): Promise<Task> {
	const { id, ...rest } = params;
	const [task] = await db.update(table.task).set(rest).where(eq(table.task.id, id)).returning();
	return task;
}

export async function deleteTask(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.task).where(eq(table.task.id, params.id));
}

export async function listTasks(
	db: DB,
	params: { projectId?: string; assigneeId?: string }
): Promise<Task[]> {
	if (params.projectId) {
		return db.select().from(table.task).where(eq(table.task.projectId, params.projectId));
	}
	if (params.assigneeId) {
		return db
			.select()
			.from(table.task)
			.innerJoin(table.taskAssignee, eq(table.task.id, table.taskAssignee.taskId))
			.where(eq(table.taskAssignee.userId, params.assigneeId));
	}
	return db.select().from(table.task);
}
