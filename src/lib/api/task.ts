import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Task } from '$lib/server/db/schema';

type DB = any;

/**
 * Create a new task. If no deadline is provided, sets it to 2 weeks from now. Accepts deadline as Date or timestamp.
 * @param db The database connection.
 * @param params Object with title, priority, status, deadline, description, llmContext, projectId.
 * @returns The created task.
 */
export async function createTask(
	db: DB,
	params: {
		title: string;
		priority: number;
		status: string;
		deadline?: Date;
		description: string;
		llmContext: string;
		projectId: string;
	}
): Promise<Task> {
	if (!params.deadline) {
		params.deadline = new Date();
		params.deadline.setDate(params.deadline.getDate() + 14);
	} else if (typeof params.deadline === 'number') {
		params.deadline = new Date(params.deadline);
	}
	const newTask: Partial<Task> = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	};
	const [task] = await db.insert(table.task).values(newTask).returning();
	return task;
}

/**
 * Fetch a task by its unique ID.
 * @param db The database connection.
 * @param params Object with task id.
 * @returns The task if found, or null.
 */
export async function getTaskById(db: DB, params: { id: string }): Promise<Task | null> {
	const [task] = await db.select().from(table.task).where(eq(table.task.id, params.id));
	return task ?? null;
}

/**
 * Update a task by ID. Only provided fields are updated.
 * @param db The database connection.
 * @param params Object with id and fields to update.
 * @returns The updated task.
 */
export async function updateTask(
	db: DB,
	params: {
		id: string;
		title?: string;
		priority?: number;
		status?: string;
		deadline?: Date;
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

/**
 * Lists all tasks for a specific project or assignee, ordered by deadline ascending.
 * @param db The database connection.
 * @param params The parameters containing the project ID or assignee ID, limited by limit (default 10) and offset (default 0).
 * @returns A list of tasks.
 */
export async function listTasks(
	db: DB,
	params: { projectId?: string; assigneeId?: string; limit?: number; offset?: number }
): Promise<Task[]> {
	let query = db
		.select()
		.from(table.task)
		.innerJoin(table.taskAssignee, eq(table.task.id, table.taskAssignee.taskId))
		.orderBy(table.task.deadline, 'asc');
	if (params.projectId) {
		query = query.where(eq(table.task.projectId, params.projectId));
	}
	if (params.assigneeId) {
		query = query.where(eq(table.taskAssignee.userId, params.assigneeId));
	}
	return query.limit(params.limit ?? 10).offset(params.offset ?? 0);
}
