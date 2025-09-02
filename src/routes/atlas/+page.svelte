<script lang="ts">
	import ProjectCards from '$lib/components/atlas/ProjectCards.svelte';
	import ActivityTable from '$lib/components/atlas/ActivityTable.svelte';
	import ActivityChart from '$lib/components/atlas/ActivityChart.svelte';
	import LLMChatBox from '$lib/components/atlas/LLMChatBox.svelte';
	import { projects, users, activities } from './data';
	let selectedProject: string | null = null;
	function selectProject(id: string) {
		selectedProject = id;
	}
</script>

<div class="flex h-screen">
	<!-- Sidebar placeholder -->
	<aside class="flex w-56 flex-col border-r bg-gray-100">
		<div class="p-4 text-lg font-bold">Atlas</div>
		<!-- Add nav here -->
	</aside>
	<main class="flex flex-1 flex-col">
		<!-- Breadcrumbs placeholder -->
		<nav class="p-4 text-sm text-gray-500">
			Home / Atlas{#if selectedProject}
				/ {projects.find((p) => p.id === selectedProject)?.name}{/if}
		</nav>
		<div class="flex flex-row gap-4 px-4">
			<div class="flex flex-1 flex-col gap-4">
				<ProjectCards
					{projects}
					{users}
					{selectedProject}
					on:select={(e) => selectProject(e.detail)}
				/>
				<ActivityTable {activities} {users} {projects} {selectedProject} />
			</div>
			<div class="flex w-[420px] flex-col gap-4">
				<ActivityChart {activities} {projects} {selectedProject} />
				<LLMChatBox {selectedProject} />
			</div>
		</div>
	</main>
</div>
