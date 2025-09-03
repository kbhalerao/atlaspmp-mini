import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';
import type { TaskActivity } from '$lib/server/db/schema';

test('create task activity', async () => {
	const userPayload = {
		operation: 'getOrCreate',
		entity: 'user',
		data: {
			username: 'Test User',
			passwordHash: 'hashed-password',
			email: 'testuser@example.com'
		}
	};
	const userRes = await unifiedApiRequest(userPayload);
	expect(userRes.status).toBe('success');
	const userId = userRes.data.id;

	const projectPayload = {
		operation: 'create',
		entity: 'project',
		data: {
			name: 'Test Project',
			description: 'A project for testing',
			llmContext: 'test',
			ownerId: userId
		}
	};
	const projectRes = await unifiedApiRequest(projectPayload);
	expect(projectRes.status).toBe('success');

	const projectId = projectRes.data.id;

    const taskPayload = {
		operation: 'create',
		entity: 'task',
		data: {
			title: 'Test Task',
			priority: 1,
			status: 'open',
			deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // one week from now
			description: 'A task for testing',
			llmContext: 'test',
			projectId: projectId
		}
	};
	const taskRes = await unifiedApiRequest(taskPayload);

	const payload = {
		operation: 'create',
		entity: 'taskActivity',
		data: {
			taskId: taskRes.data.id,
			userId: userId,
			action: 'comment',
			llmContext: 'test',
		} as Partial<TaskActivity>
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(res.data.taskId).toBe(taskRes.data.id);
});

test('read task activities', async () => {
	const payload = {
		operation: 'read',
		entity: 'taskActivity',
		data: { taskId: 'task-1' }
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});
