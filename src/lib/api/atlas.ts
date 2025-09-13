import type { AiTextGenerationToolInputWithFunction } from '@cloudflare/ai-utils';

export * from './project';
export * from './task';
export * from './taskDependency';
export * from './projectAssignee';
export * from './taskAssignee';
export * from './taskActivity';
export * from './user';

/**
 * Describes a unified Request structure of requests sent to the Atlas DB API.
 * This request will unify the ability to communicate with the database.
 */

/**
 * AtlasDBAPIRequestBody is a unified request type for all Atlas DB API operations.
 *
 * - `operation`: CRUD action to perform
 * - `entity`: The database object to operate on (must match a table/model)
 * - `data`: Payload for the operation (should include IDs, fields, or query as needed)
 *
 * Extend the `entity` union if you add new tables/models to the system.
 */
export type AtlasDBAPIRequestBody = {
	operation: 'create' | 'read' | 'update' | 'delete' | 'getOrCreate';
	entity:
		| 'project'
		| 'task'
		| 'user'
		| 'projectAssignee'
		| 'taskAssignee'
		| 'taskActivity'
		| 'taskDependency'
		| 'session';
	data: Record<string, any>;
};

/**
 * Defines a unified Response body type that describes the structure of responses from the Atlas DB API.
 */
export type AtlasDBAPIResponseBody = {
	status: 'success' | 'error';
	data?: Record<string, any>;
	error?: {
		message: string;
		code: number;
	};
};

export type DB = any; // Replace with actual DB type from Drizzle ORM
/**
 * A function that takes a database connection and returns a
 * function that returns an AI function-calling tool.
 */
export type ToolCreateFunction = (db: DB) => (params: any) => AiTextGenerationToolInputWithFunction;
