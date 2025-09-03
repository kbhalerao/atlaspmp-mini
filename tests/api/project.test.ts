import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';

test('create project', async () => {
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

	const payload = {
		operation: 'create',
		entity: 'project',
		data: {
			name: 'Test Project',
			description: 'A project for testing',
			llmContext: 'test',
			ownerId: userId
		}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(res.data.name).toBe('Test Project');
});

test('read project list', async () => {
	const payload = {
		operation: 'read',
		entity: 'project',
		data: {}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});
