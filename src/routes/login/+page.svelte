<script>
    import { fly, fade } from 'svelte/transition';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	let email = '';
	let password = '';
	let unsub;

	onMount(() => {
		unsub = page.subscribe((value) => {
			if (value?.data?.session?.user)
				goto('/');
		});
	});

	onDestroy(() => {
		unsub?.();
	});
</script>

<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
	<div class="bg-white rounded-xl p-4 w-[20rem]" in:fly="{{ y: -10, delay: 200, duration: 200 }}" out:fly="{{ y: -10, duration: 200 }}">
		<h2 class="text-2xl font-bold mb-4"><slot name="title"></slot></h2>
		<div class="pb-2">
			<slot name="content">
				{#if $page.data.session?.user}
					<p>Signed in as {$page.data.session.user.email}</p>
					<button on:click={() => signOut()}>Sign out</button>
				{:else}
				<div class="flex flex-col">
					<div class="px-2 pb-2 text-lg font-bold flex justify-center">Přihlásit</div>
					<label class="flex flex-col w-full p-2">
						<span class="p-2">Email</span>
						<input name="email" type="email" bind:value={email} class="rounded-lg p-2 text-lg"/>
					</label>
					<label class="flex flex-col w-full p-2">
						<span class="p-2">Password</span>
						<input name="password" type="password" bind:value={password} class="rounded-lg p-2 text-lg"/>
					</label>
				</div>
				{/if}
			</slot>
		</div>
		{#if !$page.data.session?.user}
		<div class="flex justify-center">
			<button class="inline-flex justify-center items-center w-full rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ml-2" on:click={() => signIn('credentials', { email, password })}>Přihlásit</button>
		</div>
		{/if}
	</div>
</div>
