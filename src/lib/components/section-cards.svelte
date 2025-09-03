<script lang="ts">
	import TrendingUpIcon from '@tabler/icons-svelte/icons/trending-up';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<div
	class="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card"
>
	{#snippet projectCard()}
		<Card.Root class="@container/card">
			<Card.Header>
				<Card.Description>Project Name</Card.Description>
				<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
					Done 4/11
				</Card.Title>
				<Card.Action>
					<Badge variant="outline">
						<TrendingUpIcon />
						+3 tasks today
					</Badge>
				</Card.Action>
			</Card.Header>
			<Card.Footer class="flex-col items-start gap-1.5 text-sm">
				<div class="line-clamp-1 flex gap-2 font-medium">Team avatars on this project</div>
				<div class="text-muted-foreground">Next deadline: 2023-12-31</div>
			</Card.Footer>
		</Card.Root>
	{/snippet}
	{@render projectCard()}
</div>
