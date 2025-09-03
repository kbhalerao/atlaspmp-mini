import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { ProjectAssignee } from '$lib/server/db/schema';

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

/**
 * Remove a user from a project by assignment ID.
 * @param db The database connection.
 * @param params Object with assignment id.
 * @returns A promise that resolves when the assignee is removed.
 */
export async function removeProjectAssignee(db: DB, params: { id: string }): Promise<void> {
	await db.delete(table.projectAssignee).where(eq(table.projectAssignee.id, params.id));
}

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
