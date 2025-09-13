/**
 * This is a singular endpoint for managing database operations.
 * It supports CRUD operations for various database entities through a unified POST call.
 */

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { AtlasDBAPIRequestBody, AtlasDBAPIResponseBody } from '$lib/api/atlas';
import * as AtlasAPI from '$lib/api/atlas';
import { get_db } from '$lib/server/db';
// @ts-ignore: Cloudflare AI binding will be available in the environment
export const POST: RequestHandler = async ({ request, platform }) => {
	// Use drizzle ORM for local dev, fallback to Cloudflare binding if present
	let db = get_db();
	// @ts-ignore
	if (platform?.env?.DB) {
		// @ts-ignore
		db = platform.env.DB;
	}

	const requestBody: AtlasDBAPIRequestBody = await request.json();

	// Validate the request body
	if (!isValidRequestBody(requestBody)) {
		return json(
			{ status: 'error', error: { message: 'Invalid request body', code: 400 } },
			{ status: 400 }
		);
	}

	try {
		const result = await handleUnifiedRequest(requestBody, db);
		return json(result, { status: result.status === 'success' ? 200 : 400 });
	} catch (e: any) {
		return json(
			{ status: 'error', error: { message: e.message || 'Internal error', code: 500 } },
			{ status: 500 }
		);
	}

	// --- Unified Validation and CRUD Handler ---

	function isValidRequestBody(body: any): body is AtlasDBAPIRequestBody {
		if (!body || typeof body !== 'object') return false;
		const { operation, entity, data } = body;
		const validOps = ['create', 'read', 'update', 'delete', 'getOrCreate'];
		const validEntities = [
			'project',
			'task',
			'user',
			'projectAssignee',
			'taskAssignee',
			'taskActivity',
			'taskDependency',
			'session'
		];
		return (
			validOps.includes(operation) && validEntities.includes(entity) && typeof data === 'object'
		);
	}

	async function handleUnifiedRequest(
		req: AtlasDBAPIRequestBody,
		db: any
	): Promise<AtlasDBAPIResponseBody> {
		// Map entity+operation to the correct API function
		const { operation, entity, data } = req;
		try {
			switch (entity) {
				case 'project':
					return await handleProject(operation, data, db);
				case 'task':
					return await handleTask(operation, data, db);
				case 'user':
					return await handleUser(operation, data, db);
				case 'projectAssignee':
					return await handleProjectAssignee(operation, data, db);
				case 'taskAssignee':
					return await handleTaskAssignee(operation, data, db);
				case 'taskActivity':
					return await handleTaskActivity(operation, data, db);
				case 'taskDependency':
					return await handleTaskDependency(operation, data, db);
				case 'session':
					return { status: 'error', error: { message: 'Session CRUD not implemented', code: 501 } };
				default:
					return { status: 'error', error: { message: 'Unknown entity', code: 400 } };
			}
		} catch (e: any) {
			return { status: 'error', error: { message: e.message || 'Internal error', code: 500 } };
		}
	}

	// --- Per-Entity Handlers ---

	async function handleProject(op: string, data: any, db: any): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.createProject(db, data) };
			case 'read':
				if (data.id) {
					const result = await AtlasAPI.getProjectById(db, data);
					return { status: 'success', data: result ?? {} };
				} else {
					return { status: 'success', data: await AtlasAPI.listProjects(db, data) };
				}
			case 'update':
				return { status: 'success', data: await AtlasAPI.updateProject(db, data) };
			case 'delete':
				await AtlasAPI.deleteProject(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}

	async function handleTask(op: string, data: any, db: any): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.createTask(db, data) };
			case 'read':
				if (data.id) {
					const result = await AtlasAPI.getTaskById(db, data);
					return { status: 'success', data: result ?? {} };
				} else {
					return { status: 'success', data: await AtlasAPI.listTasks(db, data) };
				}
			case 'update':
				return { status: 'success', data: await AtlasAPI.updateTask(db, data) };
			case 'delete':
				await AtlasAPI.deleteTask(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}

	async function handleUser(op: string, data: any, db: any): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				const result = await AtlasAPI.createUser(db, data);
				if (result) {
					return { status: 'success', data: result };
				} else {
					return { status: 'error', error: { message: 'User creation failed', code: 500 } };
				}
			case 'getOrCreate':
				const existingUser = await AtlasAPI.getUserByUsername(db, { username: data.username });
				if (existingUser) {
					return { status: 'success', data: existingUser };
				}
				const newUser = await AtlasAPI.createUser(db, data);
				if (newUser) {
					return { status: 'success', data: newUser };
				} else {
					return { status: 'error', error: { message: 'User creation failed', code: 500 } };
				}
			case 'read':
				if (data.id) {
					const result = await AtlasAPI.getUserById(db, data);
					return { status: 'success', data: result ?? {} };
				} else {
					return { status: 'success', data: await AtlasAPI.listUsers(db) };
				}
			default:
				return {
					status: 'error',
					error: { message: 'User create/update/delete not implemented', code: 501 }
				};
		}
	}

	async function handleProjectAssignee(
		op: string,
		data: any,
		db: any
	): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.addProjectAssignee(db, data) };
			case 'read':
				return { status: 'success', data: await AtlasAPI.listProjectAssignees(db, data) };
			case 'delete':
				await AtlasAPI.removeProjectAssignee(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}

	async function handleTaskAssignee(
		op: string,
		data: any,
		db: any
	): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.addTaskAssignee(db, data) };
			case 'read':
				return { status: 'success', data: await AtlasAPI.listTaskAssignees(db, data) };
			case 'delete':
				await AtlasAPI.removeTaskAssignee(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}

	async function handleTaskActivity(
		op: string,
		data: any,
		db: any
	): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.createTaskActivity(db, data) };
			case 'read':
				if (data.id) {
					const result = await AtlasAPI.getTaskActivityById(db, data);
					return { status: 'success', data: result ?? {} };
				} else {
					return { status: 'success', data: await AtlasAPI.listTaskActivities(db, data) };
				}
			case 'delete':
				await AtlasAPI.deleteTaskActivity(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}

	async function handleTaskDependency(
		op: string,
		data: any,
		db: any
	): Promise<AtlasDBAPIResponseBody> {
		switch (op) {
			case 'create':
				return { status: 'success', data: await AtlasAPI.addTaskDependency(db, data) };
			case 'read':
				return { status: 'success', data: await AtlasAPI.listTaskDependencies(db, data) };
			case 'delete':
				await AtlasAPI.removeTaskDependency(db, data);
				return { status: 'success', data: {} };
			default:
				return { status: 'error', error: { message: 'Unknown operation', code: 400 } };
		}
	}
};
