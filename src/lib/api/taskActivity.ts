import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskActivity } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

type DB = any;

/**
 * Log an activity (e.g., comment, status update) for a task.
 * @param db The database connection.
 * @param params Object with taskId, userId, action, llmContext, timestamp.
 * @returns The created task activity.
 */
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
const createCreateTaskActivityTool = (db: DB) => {
	return tool({
		name: 'createTaskActivity',
		description: 'Log an activity (e.g., comment, status update) for a task.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task.' },
				userId: { type: 'string', description: 'The ID of the user performing the action.' },
				action: { type: 'string', description: 'A description of the action performed.' },
				llmContext: { type: 'string', description: 'LLM context for the activity.' },
				timestamp: {
					type: 'number',
					description: 'The timestamp of when the activity occurred (in milliseconds since epoch).'
				}
			},
			required: ['taskId', 'userId', 'action', 'timestamp']
		},
		function: async (args: {
			taskId: string;
			userId: string;
			action: string;
			llmContext: string;
			timestamp: number;
		}) => {
			const activity = await createTaskActivity(db, {
				taskId: args.taskId,
				userId: args.userId,
				action: args.action,
				llmContext: args.llmContext,
				timestamp: args.timestamp
			});
			return JSON.stringify(activity);
		}
	});
};

/**
 * Fetch a task activity by its unique ID.
 * @param db The database connection.
 * @param params Object with activity id.
 * @returns The activity if found, or null.
 */
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
const createGetTaskActivityByIdTool = (db: DB) => {
	return tool({
		name: 'getTaskActivityById',
		description: 'Fetch a task activity by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the task activity.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			const activity = await getTaskActivityById(db, { id: args.id });
			return JSON.stringify(activity);
		}
	});
};

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
	let query = db
		.select()
		.from(table.taskActivity)
		.innerJoin(table.user, eq(table.taskActivity.userId, table.user.id))
		.innerJoin(table.task, eq(table.taskActivity.taskId, table.task.id))
		.innerJoin(table.project, eq(table.task.projectId, table.project.id))
		.orderBy(table.taskActivity.updatedAt, 'desc');
	if (params.taskId) {
		query = query.where(eq(table.taskActivity.id, params.taskId));
	}
	if (params.userId) {
		query = query.where(eq(table.user.id, params.userId));
	}
	if (params.projectId) {
		query = query.where(eq(table.project.id, params.projectId));
	}
	return query.limit(params.limit ?? 10).offset(params.offset ?? 0);
}

const createListTaskActivitiesTool = (db: DB) => {
	return tool({
		name: 'listTaskActivities',
		description:
			'List all activities for a specific task, filter by any combination of userId, projectId or taskId. Ordered by most recently modified first, and paginated by limit and offset.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task to filter activities.' },
				userId: { type: 'string', description: 'The ID of the user to filter activities.' },
				projectId: { type: 'string', description: 'The ID of the project to filter activities.' },
				limit: { type: 'number', description: 'The maximum number of activities to return.' },
				offset: {
					type: 'number',
					description: 'The number of activities to skip before starting to collect the result set.'
				}
			},
			required: []
		},
		function: async (args: {
			taskId?: string;
			userId?: string;
			projectId?: string;
			limit?: number;
			offset?: number;
		}) => {
			const activities = await listTaskActivities(db, {
				taskId: args.taskId,
				userId: args.userId,
				projectId: args.projectId,
				limit: args.limit,
				offset: args.offset
			});
			return JSON.stringify(activities);
		}
	});
};

export async function deleteTaskActivity(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskActivity).where(eq(table.taskActivity.id, params.id));
}

const createDeleteTaskActivityTool = (db: DB) => {
	return tool({
		name: 'deleteTaskActivity',
		description: 'Delete a task activity by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The unique ID of the task activity to delete.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await deleteTaskActivity(db, { id: args.id });
			return JSON.stringify({ success: true });
		}
	});
};

export const taskActivityTools = (db: DB) => [
	createCreateTaskActivityTool(db),
	createGetTaskActivityByIdTool(db),
	createListTaskActivitiesTool(db),
	createDeleteTaskActivityTool(db)
];
