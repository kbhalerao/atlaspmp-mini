// Mock data for the /atlas dashboard

export const users = [
	{ id: 'u1', name: 'Alice', avatar: '/avatars/alice.png' },
	{ id: 'u2', name: 'Bob', avatar: '/avatars/bob.png' },
	{ id: 'u3', name: 'Charlie', avatar: '/avatars/charlie.png' }
];

export const projects = [
	{
		id: 'p1',
		name: 'Soil Diagnostics',
		ownerId: 'u1',
		assignees: ['u1', 'u2'],
		openTasks: 3,
		nextDeadline: '2025-09-10'
	},
	{
		id: 'p2',
		name: 'Atlas LLM',
		ownerId: 'u2',
		assignees: ['u2', 'u3'],
		openTasks: 1,
		nextDeadline: '2025-09-15'
	}
];

export const activities = [
	{
		id: 'a1',
		action: 'Commented: "Initial soil sample uploaded"',
		task: { id: 't1', title: 'Upload soil sample', projectId: 'p1' },
		userId: 'u1',
		timestamp: '2025-09-01T10:00:00Z'
	},
	{
		id: 'a2',
		action: 'Status changed to In Progress',
		task: { id: 't2', title: 'Analyze results', projectId: 'p1' },
		userId: 'u2',
		timestamp: '2025-09-01T11:00:00Z'
	},
	{
		id: 'a3',
		action: 'Task completed',
		task: { id: 't3', title: 'Setup LLM API', projectId: 'p2' },
		userId: 'u3',
		timestamp: '2025-09-01T12:00:00Z'
	}
];
