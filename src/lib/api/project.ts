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
	const [project] = await db.insert(table.project).values(params).returning();
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

export async function listProjects(db: DB, params: { ownerId?: string }): Promise<Project[]> {
	if (params.ownerId) {
		return db.select().from(table.project).where(eq(table.project.ownerId, params.ownerId));
	}
	return db.select().from(table.project);
}
