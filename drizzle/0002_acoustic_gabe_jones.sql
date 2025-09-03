PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`llm_context` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_project`("id", "name", "description", "llm_context", "owner_id", "created_at", "updated_at") SELECT "id", "name", "description", "llm_context", "owner_id", "created_at", "updated_at" FROM `project`;--> statement-breakpoint
DROP TABLE `project`;--> statement-breakpoint
ALTER TABLE `__new_project` RENAME TO `project`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_project_assignee` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_project_assignee`("id", "project_id", "user_id", "created_at", "updated_at") SELECT "id", "project_id", "user_id", "created_at", "updated_at" FROM `project_assignee`;--> statement-breakpoint
DROP TABLE `project_assignee`;--> statement-breakpoint
ALTER TABLE `__new_project_assignee` RENAME TO `project_assignee`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at", "created_at", "updated_at") SELECT "id", "user_id", "expires_at", "created_at", "updated_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE TABLE `__new_task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`priority` integer DEFAULT 2 NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deadline` integer NOT NULL,
	`description` text NOT NULL,
	`llm_context` text NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_task`("id", "title", "priority", "status", "created_at", "updated_at", "deadline", "description", "llm_context", "project_id") SELECT "id", "title", "priority", "status", "created_at", "updated_at", "deadline", "description", "llm_context", "project_id" FROM `task`;--> statement-breakpoint
DROP TABLE `task`;--> statement-breakpoint
ALTER TABLE `__new_task` RENAME TO `task`;--> statement-breakpoint
CREATE TABLE `__new_task_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`llm_context` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_task_activity`("id", "task_id", "user_id", "action", "llm_context", "timestamp", "created_at", "updated_at") SELECT "id", "task_id", "user_id", "action", "llm_context", "timestamp", "created_at", "updated_at" FROM `task_activity`;--> statement-breakpoint
DROP TABLE `task_activity`;--> statement-breakpoint
ALTER TABLE `__new_task_activity` RENAME TO `task_activity`;--> statement-breakpoint
CREATE TABLE `__new_task_assignee` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_task_assignee`("id", "task_id", "user_id", "created_at", "updated_at") SELECT "id", "task_id", "user_id", "created_at", "updated_at" FROM `task_assignee`;--> statement-breakpoint
DROP TABLE `task_assignee`;--> statement-breakpoint
ALTER TABLE `__new_task_assignee` RENAME TO `task_assignee`;--> statement-breakpoint
CREATE TABLE `__new_task_dependency` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`depends_on_task_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_task_dependency`("id", "task_id", "depends_on_task_id", "created_at", "updated_at") SELECT "id", "task_id", "depends_on_task_id", "created_at", "updated_at" FROM `task_dependency`;--> statement-breakpoint
DROP TABLE `task_dependency`;--> statement-breakpoint
ALTER TABLE `__new_task_dependency` RENAME TO `task_dependency`;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`age` integer,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "age", "username", "password_hash", "created_at", "updated_at") SELECT "id", "age", "username", "password_hash", "created_at", "updated_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);