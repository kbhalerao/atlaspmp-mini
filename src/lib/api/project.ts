import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Project } from '$lib/server/db/schema';
import { tool } from '@cloudflare/ai-utils';

type DB = any;

/**
 * Create a new project with the given details. Generates a unique ID and timestamps.
 * @param db The database connection.
 * @param params Object with name, description, llmContext, ownerId.
 * @returns The created project.
 */
export async function createProject(
	db: DB,
	params: {
		name: string;
		description: string;
		llmContext: string;
		ownerId: string;
	}
): Promise<Project> {
	const newProject: Project = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...params
	};
	const [project] = await db.insert(table.project).values(newProject).returning();
	return project;
}

const createCreateProjectTool = (db: DB) => {
	return tool({
		name: 'createProject',
		description: 'Create a new project with the given details.',
		parameters: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'The name of the project.' },
				description: { type: 'string', description: 'A brief description of the project.' },
				llmContext: { type: 'string', description: 'LLM context for the project.' },
				ownerId: { type: 'string', description: 'The ID of the user who owns the project.' }
			},
			required: ['name', 'ownerId']
		},
		function: async (args: {
			name: string;
			description?: string;
			llmContext?: string;
			ownerId: string;
		}) => {
			const project = await createProject(db, {
				name: args.name,
				description: args.description ?? '',
				llmContext: args.llmContext ?? '',
				ownerId: args.ownerId
			});
			return JSON.stringify(project);
		}
	});
};

/**
 * Fetch a project by its unique ID.
 * @param db The database connection.
 * @param params Object with project id.
 * @returns The project if found, or null.
 */
export async function getProjectById(db: DB, params: { id: string }): Promise<Project | null> {
	const [project] = await db.select().from(table.project).where(eq(table.project.id, params.id));
	return project ?? null;
}

const createGetProjectByIDTool = (db: DB) => {
	return tool({
		name: 'getProjectByID',
		description: 'Fetch a project by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The unique ID of the project to fetch.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			const project = await getProjectById(db, { id: args.id });
			return JSON.stringify(project ?? {});
		}
	});
};

/**
 * Update a project by ID. Only provided fields are updated.
 * @param db The database connection.
 * @param params Object with id and fields to update.
 * @returns The updated project.
 */
export async function updateProject(
	db: DB,
	params: {
		id: string;
		name?: string;
		description?: string;
		llmContext?: string;
		ownerId?: string;
	}
): Promise<Project> {
	const { id, ...rest } = params;
	const [project] = await db
		.update(table.project)
		.set(rest)
		.where(eq(table.project.id, id))
		.returning();
	return project;
}

const createUpdateProjectTool = (db: DB) => {
	return tool({
		name: 'updateProject',
		description: 'Update a project by its ID. Only provided fields will be updated.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The unique ID of the project to update.' },
				name: { type: 'string', description: 'The new name of the project.' },
				description: { type: 'string', description: 'The new description of the project.' },
				llmContext: { type: 'string', description: 'The new LLM context for the project.' },
				ownerId: { type: 'string', description: 'The ID of the user who owns the project.' }
			},
			required: ['id']
		},
		function: async (args: {
			id: string;
			name?: string;
			description?: string;
			llmContext?: string;
			ownerId?: string;
		}) => {
			const project = await updateProject(db, args);
			return JSON.stringify(project);
		}
	});
};
/**
 * Deletes a project by its ID.
 * @param db The database connection.
 * @param params The parameters containing the project ID.
 * @returns A promise that resolves when the project is deleted.
 */
export async function deleteProject(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.project).where(eq(table.project.id, params.id));
}
const createDeleteProjectTool = (db: DB) => {
	return tool({
		name: 'deleteProject',
		description: 'Delete a project by its unique ID.',
		parameters: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'The unique ID of the project to delete.' }
			},
			required: ['id']
		},
		function: async (args: { id: string }) => {
			await deleteProject(db, { id: args.id });
			return JSON.stringify({ success: true });
		}
	});
};

/**
 * Lists projects for a specific user (optional), and ordered by updatedAt descending
 * @param db The database connection.
 * @param params The parameters containing the owner ID, with limit (default 10) and offset (default 0)
 * @returns A list of projects.
 */
export async function listProjects(
	db: DB,
	params: { ownerId?: string; limit?: number; offset?: number }
): Promise<Project[]> {
	let query = db.select().from(table.project).orderBy(table.project.updatedAt, 'desc');
	if (params.ownerId) {
		query = query.where(eq(table.project.ownerId, params.ownerId));
	}
	return query.limit(params.limit ?? 10).offset(params.offset ?? 0);
}

const createListProjectsTool = (db: DB) => {
	return tool({
		name: 'listProjects',
		description:
			'List projects, optionally filtered by owner ID, ordered by most recently updated.',
		parameters: {
			type: 'object',
			properties: {
				ownerId: { type: 'string', description: 'The ID of the user who owns the projects.' },
				limit: { type: 'number', description: 'Maximum number of projects to return.' },
				offset: { type: 'number', description: 'Number of projects to skip for pagination.' }
			},
			required: []
		},
		function: async (args: { ownerId?: string; limit?: number; offset?: number }) => {
			const projects = await listProjects(db, args);
			return JSON.stringify(projects);
		}
	});
};

export const projectTools = (db: DB) => [
	createCreateProjectTool(db),
	createGetProjectByIDTool(db),
	createUpdateProjectTool(db),
	createDeleteProjectTool(db),
	createListProjectsTool(db)
];
