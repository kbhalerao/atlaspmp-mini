<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	let message = '';
	type ChatMessage = { role: string; content: string };

	let conversation: ChatMessage[] = [];
	function send() {
		if (message.trim() === '') return;
		conversation = [...conversation, { role: 'user', content: message }];
		message = '';
		// Call the LLM API with the updated conversation
		fetch('/ai', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ conversation })
		})
			.then((res) => res.json())
			.then((data) => {
				console.log('LLM Response:', data);
				if (data.response) {
					conversation = [...conversation, { role: 'atlas', content: data.response }];
				}
			})
			.catch((err) => console.error('Error:', err));
	}
</script>

<div class="flex h-96 flex-col rounded-lg bg-white p-4 shadow">
	<div class="mb-2 flex-1 overflow-y-auto">
		{#each conversation as c}
			<div class="mb-1"><b>{c.role}:</b> {c.content}</div>
		{/each}
	</div>
	<div class="flex gap-2">
		<Textarea
			bind:value={message}
			class="flex-1"
			rows={2}
			placeholder="Ask the LLM about your projects..."
		/>
		<button class="rounded bg-blue-600 px-3 py-1 text-white" onclick={send}>Send</button>
	</div>
</div>
