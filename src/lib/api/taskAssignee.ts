import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskAssignee } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

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

const createAddTaskAssigneeTool = (db: DB) => {
	return tool({
		name: 'addTaskAssignee',
		description: 'Assign a user to a task.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task.' },
				userId: { type: 'string', description: 'The ID of the user to assign.' }
			},
			required: ['taskId', 'userId']
		},
		function: async (args: { taskId: string; userId: string }) => {
			const assignee = await addTaskAssignee(db, {
				taskId: args.taskId,
				userId: args.userId
			});
			return JSON.stringify(assignee);
		}
	});
};

/**
 * Remove a user from a task by assignment ID.
 * @param db The database connection.
 * @param params Object with assignment id.
 * @returns A promise that resolves when the assignee is removed.
 */
export async function removeTaskAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskAssignee).where(eq(table.taskAssignee.id, params.id));
}

const createRemoveTaskAssigneeTool = (db: DB) => {
	return tool({
		name: 'removeTaskAssignee',
		description: 'Remove a user from a task by assignment ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the task assignee record.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await removeTaskAssignee(db, { id: args.id });
			return `Task assignee with ID ${args.id} removed successfully.`;
		}
	});
};

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

const createListTaskAssigneesTool = (db: DB) => {
	return tool({
		name: 'listTaskAssignees',
		description: 'List all users assigned to a task.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task.' }
			},
			required: ['taskId']
		},
		function: async (args: { taskId: string }) => {
			const assignees = await listTaskAssignees(db, { taskId: args.taskId });
			return JSON.stringify(assignees);
		}
	});
};

export const taskAssigneeTools = (db: DB) => {
	return [
		createAddTaskAssigneeTool(db),
		createRemoveTaskAssigneeTool(db),
		createListTaskAssigneesTool(db)
	];
};
