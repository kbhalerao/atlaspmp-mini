<script lang="ts">
	import {
		Table,
		TableHead,
		TableRow,
		TableCell,
		TableBody
	} from '$lib/components/ui/table/index.js';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	export let activities = [];
	export let users = [];
	export let projects = [];
	export let selectedProject: string | null = null;
	function getUser(id: string) {
		return users.find((u) => u.id === id);
	}
	function getProject(id: string) {
		return projects.find((p) => p.id === id);
	}
</script>

<Table>
	<TableHead>
		<TableRow>
			<TableCell>Activity</TableCell>
			<TableCell>Task</TableCell>
			<TableCell>Person</TableCell>
			<TableCell>Time</TableCell>
			{#if !selectedProject}
				<TableCell>Project</TableCell>
			{/if}
		</TableRow>
	</TableHead>
	<TableBody>
		{#each activities.filter((a) => !selectedProject || a.task.projectId === selectedProject) as activity}
			<TableRow>
				<TableCell>{activity.action}</TableCell>
				<TableCell>{activity.task.title}</TableCell>
				<TableCell>
					<div class="flex items-center gap-2">
						<Avatar
							src={getUser(activity.userId)?.avatar}
							alt={getUser(activity.userId)?.name}
							size="sm"
						/>
						<span>{getUser(activity.userId)?.name}</span>
					</div>
				</TableCell>
				<TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
				{#if !selectedProject}
					<TableCell>{getProject(activity.task.projectId)?.name}</TableCell>
				{/if}
			</TableRow>
		{/each}
	</TableBody>
</Table>
