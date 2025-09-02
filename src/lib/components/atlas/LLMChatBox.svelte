<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	export let selectedProject: string | null = null;
	let message = '';
	let chat: { sender: string; text: string }[] = [
		{ sender: 'LLM', text: 'Hello! How can I help you with your projects today?' }
	];
	function send() {
		if (message.trim()) {
			chat = [...chat, { sender: 'You', text: message }];
			// Here you would call the LLM API and push its response
			chat = [...chat, { sender: 'LLM', text: 'This is a mock response.' }];
			message = '';
		}
	}
</script>

<div class="flex h-64 flex-col rounded-lg bg-white p-4 shadow">
	<div class="mb-2 flex-1 overflow-y-auto">
		{#each chat as c}
			<div class="mb-1"><b>{c.sender}:</b> {c.text}</div>
		{/each}
	</div>
	<div class="flex gap-2">
		<Textarea
			bind:value={message}
			class="flex-1"
			rows={2}
			placeholder="Ask the LLM about your projects..."
		/>
		<button class="rounded bg-blue-600 px-3 py-1 text-white" on:click={send}>Send</button>
	</div>
</div>
