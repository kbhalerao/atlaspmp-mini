<script lang="ts">
	import { projects, users, activities } from './data.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AtlasSidebar from '$lib/components/atlas/AtlasSidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import SectionCards from '$lib/components/section-cards.svelte';
	import ChartAreaInteractive from '$lib/components/chart-area-interactive.svelte';
	import DataTable from '$lib/components/data-table.svelte';
	import LlmChatBox from '$lib/components/atlas/LLMChatBox.svelte';
	import ActivityTable from '$lib/components/atlas/ActivityTable.svelte';
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AtlasSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
		<div class="flex flex-1 flex-col">
			<div class="@container/main flex flex-1 flex-col gap-2">
				<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<SectionCards />
					<div class="px-4 lg:px-6">
						<LlmChatBox />
					</div>
					<div class="px-4 lg:px-6">
						<ChartAreaInteractive />
					</div>
					<div class="px-4 lg:px-6">
						<ActivityTable {projects} {users} {activities} />
					</div>
					<div class="px-4 pb-4 lg:px-6 lg:pb-6">
						<DataTable data={activities} />
					</div>
				</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
