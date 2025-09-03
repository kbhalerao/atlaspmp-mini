CREATE TABLE `project` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`llm_context` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `project_assignee` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`title` text NOT NULL,
	`priority` integer DEFAULT 2 NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`deadline` integer NOT NULL,
	`description` text NOT NULL,
	`llm_context` text NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task_activity` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`llm_context` text NOT NULL,
	`timestamp` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task_assignee` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task_dependency` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`task_id` text NOT NULL,
	`depends_on_task_id` text NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
	`age` integer,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL,
	`updated_at` integer DEFAULT cast(strftime('%s','now') as integer) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);