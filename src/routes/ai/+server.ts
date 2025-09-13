import { json, type RequestHandler } from '@sveltejs/kit';
import { autoTrimTools, runWithTools } from '@cloudflare/ai-utils';
// import type { DB } from '$lib/api/atlas';
import { userTools } from '$lib/api/user';
import { projectTools } from '$lib/api/project';
import { taskTools } from '$lib/api/task';
import { projectAssigneeTools } from '$lib/api/projectAssignee';
import { taskAssigneeTools } from '$lib/api/taskAssignee';
import { taskActivityTools } from '$lib/api/taskActivity';
import { taskDependencyTools } from '$lib/api/taskDependency';
import type { AnyD1Database } from 'drizzle-orm/d1';
import { get_db } from '$lib/server/db';

type Env = {
	AI: any;
	D1: AnyD1Database;
};

const systemMessage = `You are an expert project management assistant designed to supercharge a project manager’s productivity. You have access to advanced tools for querying users, projects, tasks, assignments, activities, dependencies, and more from the database.
Your role is to help the user track progress, manage assignments, and resolve bottlenecks with actionable insights. When responding, use the available tools to fetch and synthesize relevant information, then deliver a brief, focused narrative that highlights key details, next steps, and any urgent issues.
Always keep your narration succinct to conserve context memory—summarize only the most important facts, avoid unnecessary repetition, and present information in a way that enables fast, effective decision-making.
If multiple tools are relevant, combine their outputs for a holistic overview, but prioritize clarity and brevity. Your goal is to make project management effortless, insightful, and efficient.
`;

export const POST: RequestHandler = async ({ request, platform }) => {
	// @ts-ignore
	const env = platform?.env as Env;
	if (!env?.AI) {
		return json({ status: 'error', message: 'AI environment not configured' }, { status: 500 });
	}
	if (!env?.D1) {
		return json(
			{ status: 'error', message: 'Database environment not configured' },
			{ status: 500 }
		);
	}
	const db = get_db() as AnyD1Database;
	const body = await request.json();
	const response = await runWithTools(
		env.AI,
		// Model with function calling support
		'@hf/nousresearch/hermes-2-pro-mistral-7b',
		{
			// Messages
			messages: [
				{
					role: 'system',
					content: systemMessage
				},
				...body.conversation
			],
			// Definition of available tools the AI model can leverage
			tools: [
				...userTools(db),
				...projectTools(db),
				...taskTools(db),
				...projectAssigneeTools(db),
				...taskAssigneeTools(db),
				...taskActivityTools(db),
				...taskDependencyTools(db)
			]
		},
		{
			trimFunction: autoTrimTools
		}
	);

	return json({ status: 'success', response: response.response });
};

export const GET: RequestHandler = async ({ request, platform }) => {
	return json({ status: 'success', response: 'AI endpoint is under construction' });
};
