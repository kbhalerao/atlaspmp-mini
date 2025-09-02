<script lang="ts">
	// Placeholder for a chart. You can replace with a real chart component later.
	export let activities = [];
	export let projects = [];
	export let selectedProject: string | null = null;
</script>

<div class="flex h-48 flex-col items-center justify-center rounded-lg bg-white p-4 shadow">
	<div class="mb-2 text-sm text-gray-500">Activity per Project (mock)</div>
	<div class="flex gap-4">
		{#each projects.filter((p) => !selectedProject || p.id === selectedProject) as project}
			<div class="flex flex-col items-center">
				<div class="flex h-24 w-8 items-end rounded-t-lg bg-blue-200">
					<div
						class="w-8 rounded-t-lg bg-blue-600"
						style="height: {activities.filter((a) => a.task.projectId === project.id).length *
							20}px"
					></div>
				</div>
				<div class="mt-1 text-xs">{project.name}</div>
			</div>
		{/each}
	</div>
</div>
