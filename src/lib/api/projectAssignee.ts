import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { ProjectAssignee } from '$lib/server/db/schema';

type DB = any;

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

export async function removeProjectAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.projectAssignee).where(eq(table.projectAssignee.id, params.id));
}

/**
 * Lists all assignees for a specific project, ordered by assignment creation date
 * @param db The database connection.
 * @param params The parameters containing the project ID.
 * @returns A list of project assignees
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
