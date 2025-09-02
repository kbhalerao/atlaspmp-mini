<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card/index.js';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	export let projects = [];
	export let users = [];
	export let selectedProject: string | null = null;
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	function getUser(id: string) {
		return users.find((u) => u.id === id);
	}
</script>

<div class="flex gap-4">
	{#each projects as project}
		<Card
			class="w-72 cursor-pointer border-2 {selectedProject === project.id
				? 'border-blue-600'
				: 'border-transparent'}"
			on:click={() => dispatch('select', project.id)}
		>
			<CardHeader class="flex flex-row items-center gap-2">
				<span class="text-lg font-bold">{project.name}</span>
				<span class="ml-auto text-xs text-gray-500">{project.openTasks} open</span>
			</CardHeader>
			<CardContent>
				<div class="mb-2 flex items-center gap-2">
					<Avatar
						src={getUser(project.ownerId)?.avatar}
						alt={getUser(project.ownerId)?.name}
						size="sm"
					/>
					<span class="text-xs text-gray-700">Owner</span>
					{#each project.assignees as aid}
						<Avatar src={getUser(aid)?.avatar} alt={getUser(aid)?.name} size="sm" />
					{/each}
				</div>
				<div class="text-xs text-gray-500">Next deadline: {project.nextDeadline}</div>
			</CardContent>
		</Card>
	{/each}
</div>
