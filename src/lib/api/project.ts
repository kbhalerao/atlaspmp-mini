import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Project } from '$lib/server/db/schema';

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

/**
 * Deletes a project by its ID.
 * @param db The database connection.
 * @param params The parameters containing the project ID.
 * @returns A promise that resolves when the project is deleted.
 */
export async function deleteProject(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.project).where(eq(table.project.id, params.id));
}

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
