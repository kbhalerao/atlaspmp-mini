import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';

test('add task dependency', async () => {
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

	// Create task-2
    const task2Payload = {
        operation: 'create',
        entity: 'task',
        data: {
            title: 'Test Task 2',
            priority: 2,
            status: 'open',
            deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // one week from now
            description: 'A second task for testing',
            llmContext: 'test',
            projectId: projectId
        }
    };
    
	const task2res = await unifiedApiRequest(task2Payload);
	
    const payload = {
		operation: 'create',
		entity: 'taskDependency',
		data: {
			taskId: taskRes.data.id,
			dependsOnTaskId: task2res.data.id
		}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(res.data.taskId).toBe(taskRes.data.id);
});

test('read task dependencies', async () => {
	const payload = {
		operation: 'read',
		entity: 'taskDependency',
		data: { taskId: 'task-1' }
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});
