import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { TaskDependency } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

type DB = any;

/**
 * Add a dependency: taskId depends on dependsOnTaskId.
 * @param db The database connection.
 * @param params Object with taskId and dependsOnTaskId.
 * @returns The created task dependency.
 */
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

const createAddTaskDependencyTool = (db: DB) => {
	return tool({
		name: 'addTaskDependency',
		description: 'Add a dependency: taskId depends on dependsOnTaskId.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task.' },
				dependsOnTaskId: { type: 'string', description: 'The ID of the task it depends on.' }
			},
			required: ['taskId', 'dependsOnTaskId']
		},
		function: async (args: { taskId: string; dependsOnTaskId: string }) => {
			const dependency = await addTaskDependency(db, {
				taskId: args.taskId,
				dependsOnTaskId: args.dependsOnTaskId
			});
			return JSON.stringify(dependency);
		}
	});
};

/**
 * Remove a dependency by its unique ID.
 * @param db The database connection.
 * @param params Object with dependency id.
 * @returns A promise that resolves when the dependency is removed.
 */
export async function removeTaskDependency(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.taskDependency).where(eq(table.taskDependency.id, params.id));
}
const createRemoveTaskDependencyTool = (db: DB) => {
	return tool({
		name: 'removeTaskDependency',
		description: 'Remove a dependency by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the dependency to remove.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await removeTaskDependency(db, { id: args.id });
			return `Dependency with ID ${args.id} removed.`;
		}
	});
};

/**
 * List all dependencies for a given task.
 * @param db The database connection.
 * @param params Object with taskId.
 * @returns Array of task dependencies.
 */
export async function listTaskDependencies(
	db: DB,
	params: { taskId: string }
): Promise<TaskDependency[]> {
	return db
		.select()
		.from(table.taskDependency)
		.where(eq(table.taskDependency.taskId, params.taskId));
}

const createListTaskDependenciesTool = (db: DB) => {
	return tool({
		name: 'listTaskDependencies',
		description: 'List all dependencies for a given task.',
		parameters: {
			type: 'object',
			properties: {
				taskId: { type: 'string', description: 'The ID of the task.' }
			},
			required: ['taskId']
		},
		function: async (args: { taskId: string }) => {
			const dependencies = await listTaskDependencies(db, { taskId: args.taskId });
			return JSON.stringify(dependencies);
		}
	});
};

export const taskDependencyTools = (db: DB) => {
	return [
		createAddTaskDependencyTool(db),
		createRemoveTaskDependencyTool(db),
		createListTaskDependenciesTool(db)
	];
};
