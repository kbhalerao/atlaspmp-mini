import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { ProjectAssignee } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

type DB = any;

/**
 * Assign a user to a project.
 * @param db The database connection.
 * @param params Object with projectId and userId.
 * @returns The created project assignee.
 */
export async function addProjectAssignee(
	db: DB,
	params: { projectId: string; userId: string }
): Promise<ProjectAssignee> {
	const newAssignee: ProjectAssignee = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	};
	const [assignee] = await db.insert(table.projectAssignee).values(newAssignee).returning();
	return assignee;
}
const createAddProjectAssigneeTool = (db: DB) => {
	return tool({
		name: 'addProjectAssignee',
		description: 'Assign a user to a project.',
		parameters: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The ID of the project.' },
				userId: { type: 'string', description: 'The ID of the user to assign.' }
			},
			required: ['projectId', 'userId']
		},
		function: async (args: { projectId: string; userId: string }) => {
			const assignee = await addProjectAssignee(db, {
				projectId: args.projectId,
				userId: args.userId
			});
			return JSON.stringify(assignee);
		}
	});
};

/**
 * Remove a user from a project by assignment ID.
 * @param db The database connection.
 * @param params Object with assignment id.
 * @returns A promise that resolves when the assignee is removed.
 */
export async function removeProjectAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.projectAssignee).where(eq(table.projectAssignee.id, params.id));
}

const createRemoveProjectAssigneeTool = (db: DB) => {
	return tool({
		name: 'removeProjectAssignee',
		description: 'Remove a user from a project by assignment ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The ID of the project assignee to remove.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await removeProjectAssignee(db, { id: args.id });
			return JSON.stringify({ success: true });
		}
	});
};
/**
 * List all users assigned to a project, ordered by assignment date.
 * @param db The database connection.
 * @param params Object with projectId.
 * @returns Array of project assignees.
 */
export async function listProjectAssignees(
	db: DB,
	params: { projectId: string }
): Promise<ProjectAssignee[]> {
	return db
		.select()
		.from(table.projectAssignee)
		.where(eq(table.projectAssignee.projectId, params.projectId))
		.orderBy(table.projectAssignee.createdAt);
}

const createListProjectAssigneesTool = (db: DB) => {
	return tool({
		name: 'listProjectAssignees',
		description: 'List all users assigned to a project, ordered by assignment date.',
		parameters: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The ID of the project.' }
			},
			required: ['projectId']
		},
		function: async (args: { projectId: string }) => {
			const assignees = await listProjectAssignees(db, { projectId: args.projectId });
			return JSON.stringify(assignees);
		}
	});
};

export const projectAssigneeTools = (db: DB) => [
	createAddProjectAssigneeTool(db),
	createRemoveProjectAssigneeTool(db),
	createListProjectAssigneesTool(db)
];
