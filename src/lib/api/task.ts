import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Task } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

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

const createCreateTaskTool = (db: DB) => {
	return tool({
		name: 'createTask',
		description: 'Create a new task with the given details.',
		parameters: {
			type: 'object',
			properties: {
				title: { type: 'string', description: 'The title of the task.' },
				priority: { type: 'number', description: 'The priority of the task (1-5).' },
				status: { type: 'string', description: 'The status of the task.' },
				deadline: {
					type: 'string',
					format: 'date-time',
					description: 'The deadline of the task in ISO 8601 format.'
				},
				description: { type: 'string', description: 'A brief description of the task.' },
				llmContext: { type: 'string', description: 'LLM context for the task.' },
				projectId: { type: 'string', description: 'The ID of the project this task belongs to.' }
			},
			required: ['title', 'priority', 'status', 'projectId']
		},
		function: async (args: {
			title: string;
			priority: number;
			status: string;
			deadline?: string;
			description?: string;
			llmContext?: string;
			projectId: string;
		}) => {
			const task = await createTask(db, {
				title: args.title,
				priority: args.priority,
				status: args.status,
				deadline: args.deadline ? new Date(args.deadline) : undefined,
				description: args.description ?? '',
				llmContext: args.llmContext ?? '',
				projectId: args.projectId
			});
			return JSON.stringify(task);
		}
	});
};

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

const createGetTaskByIdTool = (db: DB) => {
	return tool({
		name: 'getTaskById',
		description: 'Fetch a task by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the task.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			const task = await getTaskById(db, { id: args.id });
			return JSON.stringify(task);
		}
	});
};

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

const createUpdateTaskTool = (db: DB) => {
	return tool({
		name: 'updateTask',
		description: 'Update a task by its ID. Only provide fields that need to be updated.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the task to update.' },
				title: { type: 'string', description: 'The new title of the task.' },
				priority: { type: 'number', description: 'The new priority of the task (1-5).' },
				status: { type: 'string', description: 'The new status of the task.' },
				deadline: {
					type: 'string',
					format: 'date-time',
					description: 'The new deadline of the task in ISO 8601 format.'
				},
				description: { type: 'string', description: 'The new description of the task.' },
				llmContext: { type: 'string', description: 'The new LLM context for the task.' },
				projectId: { type: 'string', description: 'The ID of the project this task belongs to.' }
			},
			required: ['id']
		},
		function: async (args: {
			id: string;
			title?: string;
			priority?: number;
			status?: string;
			deadline?: string;
			description?: string;
			llmContext?: string;
			projectId?: string;
		}) => {
			const task = await updateTask(db, {
				id: args.id,
				title: args.title,
				priority: args.priority,
				status: args.status,
				deadline: args.deadline ? new Date(args.deadline) : undefined,
				description: args.description,
				llmContext: args.llmContext,
				projectId: args.projectId
			});
			return JSON.stringify(task);
		}
	});
};

export async function deleteTask(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.task).where(eq(table.task.id, params.id));
}

const createDeleteTaskTool = (db: DB) => {
	return tool({
		name: 'deleteTask',
		description: 'Delete a task by its ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the task to delete.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await deleteTask(db, { id: args.id });
			return JSON.stringify({ success: true });
		}
	});
};

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

const createListTasksTool = (db: DB) => {
	return tool({
		name: 'listTasks',
		description: 'List tasks for a specific project or assignee, ordered by deadline ascending.',
		parameters: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The ID of the project to filter tasks.' },
				assigneeId: { type: 'string', description: 'The ID of the assignee to filter tasks.' },
				limit: { type: 'number', description: 'The maximum number of tasks to return.' },
				offset: {
					type: 'number',
					description: 'The number of tasks to skip before starting to collect the result set.'
				}
			},
			required: []
		},
		function: async (args: {
			projectId?: string;
			assigneeId?: string;
			limit?: number;
			offset?: number;
		}) => {
			const tasks = await listTasks(db, {
				projectId: args.projectId,
				assigneeId: args.assigneeId,
				limit: args.limit,
				offset: args.offset
			});
			return JSON.stringify(tasks);
		}
	});
};

export const taskTools = (db: DB) => [
	createCreateTaskTool(db),
	createGetTaskByIdTool(db),
	createUpdateTaskTool(db),
	createDeleteTaskTool(db),
	createListTasksTool(db)
];
