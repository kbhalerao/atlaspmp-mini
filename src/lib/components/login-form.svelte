<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	let showInvite = false;
	let action = 'login';
	let form: any = {};
	let username = '';
	let password = '';
	let invite = '';

	function switchToRegister() {
		showInvite = true;
		action = 'register';
	}
	function switchToLogin() {
		showInvite = false;
		action = 'login';
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">{action === 'login' ? 'Login' : 'Register'}</Card.Title>
		<Card.Description>
			{action === 'login'
				? 'Enter your username and password to login.'
				: 'Register a new account (invitation required).'}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="post" action={action === 'login' ? '?/login' : '?/register'}>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input id="username" name="username" bind:value={username} required />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" name="password" type="password" bind:value={password} required />
				</div>
				{#if showInvite}
					<div class="grid gap-2">
						<Label for="invite">Invitation Code</Label>
						<Input id="invite" name="invite" bind:value={invite} required />
					</div>
				{/if}
				<Button type="submit" class="w-full">{action === 'login' ? 'Login' : 'Register'}</Button>
			</div>
		</form>
		<div class="mt-4 text-center text-sm">
			{#if action === 'login'}
				Don't have an account?
				<a href="#register" class="underline" on:click|preventDefault={switchToRegister}>
					Sign up
				</a>
			{:else}
				Already have an account?
				<a href="#login" class="underline" on:click|preventDefault={switchToLogin}> Login </a>
			{/if}
		</div>
		<p class="mt-2 text-red-600">{form?.message ?? ''}</p>
		<p class="mt-2 text-xs text-gray-400">[DEBUG] action: {action}, form: {JSON.stringify(form)}</p>
	</Card.Content>
</Card.Root>
