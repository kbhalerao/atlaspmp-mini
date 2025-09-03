import { test, expect } from 'vitest';
import { unifiedApiRequest } from '../utils';
import type { User } from '../../src/lib/server/db/schema';

test('read user list', async () => {
	const payload = {
		operation: 'read',
		entity: 'user',
		data: {}
	};
	const res = await unifiedApiRequest(payload);
	expect(res.status).toBe('success');
	expect(Array.isArray(res.data)).toBe(true);
});

test('get or create user', async () => {
	const user: Partial<User> = {
		username: 'testuser',
		passwordHash: 'hashed-password'
	};

	const payload = {
		operation: 'getOrCreate',
		entity: 'user',
		data: user
	};
	const res = await unifiedApiRequest(payload);
	console.log(res);
	expect(res.status).toBe('success');
	expect(res.data).toHaveProperty('id');
});
