import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';
import type { Task } from '$lib/server/db/schema';

test('create task', async () => {
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
	const payload = {
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
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(res.data.title).toBe('Test Task');
});

test('read task list', async () => {
	const payload = {
		operation: 'read',
		entity: 'task',
		data: {}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});
