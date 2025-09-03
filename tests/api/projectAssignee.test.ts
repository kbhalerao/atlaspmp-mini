import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';

test('add project assignee', async () => {
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
		entity: 'projectAssignee',
		data: {
			projectId: projectId,
			userId: userId
		}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(res.data.projectId).toBe(projectId);
});

test('read project assignees', async () => {
	const payload = {
		operation: 'read',
		entity: 'projectAssignee',
		data: { projectId: 'project-1' }
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});
