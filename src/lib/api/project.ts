import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Project } from '$lib/server/db/schema';

type DB = any;

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

export async function getProjectById(db: DB, params: { id: string }): Promise<Project | null> {
	const [project] = await db.select().from(table.project).where(eq(table.project.id, params.id));
	return project ?? null;
}

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

export async function deleteProject(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.project).where(eq(table.project.id, params.id));
}

/**
 * Lists projects for a specific user (optional), and ordered by updatedAt descending
 * @param db The database connection.
 * @param params The parameters containing the owner ID, with limit (default 10) and offset (default 0)
 * @returns A list of projects.
 */
export async function listProjects(db: DB, params: { ownerId?: string; limit?: number; offset?: number }): Promise<Project[]> {
	let query = db.select().from(table.project).orderBy(table.project.updatedAt, 'desc');
	if (params.ownerId) {
		query = query.where(eq(table.project.ownerId, params.ownerId));
	}
	return query.limit(params.limit ?? 10).offset(params.offset ?? 0);
}
