import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * NOTE - Application code is responsible for setting unique IDs and timestamps when
 * creating and updating records.
 */

/**
 * Represents a user in the system.
 */
export const user = sqliteTable('user', {
	id: text('id').primaryKey().notNull(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents a user session in the system.
 */
export const session = sqliteTable('session', {
	id: text('id').primaryKey().notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents a project in the system.
 */
export const project = sqliteTable('project', {
	id: text('id').primaryKey().notNull(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	llmContext: text('llm_context').notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents tasks associated with a Project.
 */
export const task = sqliteTable('task', {
	id: text('id').primaryKey().notNull(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(2),
	status: text('status').notNull().default('todo'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	deadline: integer('deadline', { mode: 'timestamp' }).notNull(),
	description: text('description').notNull(),
	llmContext: text('llm_context').notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id)
});

/**
 * Represents dependencies between tasks.
 * Each row means taskId depends on dependsOnTaskId.
 */
export const taskDependency = sqliteTable('task_dependency', {
	id: text('id').primaryKey().notNull(),
	taskId: text('task_id')
		.notNull()
		.references(() => task.id),
	dependsOnTaskId: text('depends_on_task_id')
		.notNull()
		.references(() => task.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents users assigned to a Project other than the owner.
 * This allows multiple users to collaborate on a project, and people from this project
 * can be assigned tasks within the project.
 */
export const projectAssignee = sqliteTable('project_assignee', {
	id: text('id').primaryKey().notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents users assigned to a Task.
 */
export const taskAssignee = sqliteTable('task_assignee', {
	id: text('id').primaryKey().notNull(),
	taskId: text('task_id')
		.notNull()
		.references(() => task.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Represents the activity associated with a task.
 * This includes comments, status updates, and other interactions.
 */
export const taskActivity = sqliteTable('task_activity', {
	id: text('id').primaryKey().notNull(),
	taskId: text('task_id')
		.notNull()
		.references(() => task.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	action: text('action').notNull(),
	llmContext: text('llm_context').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;
export type Task = typeof task.$inferSelect;
export type ProjectAssignee = typeof projectAssignee.$inferSelect;
export type TaskAssignee = typeof taskAssignee.$inferSelect;
export type TaskActivity = typeof taskActivity.$inferSelect;
export type TaskDependency = typeof taskDependency.$inferSelect;
