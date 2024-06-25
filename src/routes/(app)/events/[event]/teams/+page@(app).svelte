<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import { fly, fade } from 'svelte/transition';
	import { enhance, applyAction } from '$app/forms';
	import { writable } from 'svelte/store';
	import Confirm from '$lib/components/Confirm.svelte';
	import { onMount } from 'svelte';

	export let data;

	let input_ref = null;
	let button_ref = null;


    let teams = data.teams;
	let team = writable({});
	//console.log('Teams:', teams);
	let form_visible = false;
	let form_action = 'create';

	console.log('PAGE', $page.data);

	async function edit_team(id) {
		var t = teams.find(t => t.id === id);
		console.log('edit_team', t);
		team.set(t);
		form_action = 'update';
		form_visible = true;
		setTimeout(() => input_ref.focus(), 300);
	}

	async function delete_team(id) {
		var t = teams.find(t => t.id === id);
		console.log('delete_team', t);
		const res = await fetch(`/api/events/${$page.params.event}/teams/${id}`, { method: 'DELETE' });
		const data = await res.json();
		console.log('delete_team', data);
		await fetchTeams();
	}

	async function fetchTeams() {
		const res = await fetch(`/api/events/${$page.params.event}/teams`, { headers: { Accept: 'application/json' }});
		const data = await res.json();
		console.log('fetchTeams', data.teams);
		teams = data;
	}

	async function prepare_matches() {
		const res = await fetch(`/api/events/${$page.params.event}/matches/init`);
		if (res.ok) {
			location.href = `/events/${$page.params.event}/matches`;
		} else {
			console.error('prepare_matches', res);
		}
	};

	onMount(() => {
		button_ref?.focus();
	});
</script>

<div class="p-4 mx-auto">
	<div class="flex justify-between mb-2">
		<h1 class="text-4xl font-bold mb-2">Týmy</h1>
		<div>
			<button disabled={teams.length === 32} class="inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700" type="button" on:click={() => { team.set({}); form_action = 'create'; form_visible = true; setTimeout(() => input_ref.focus(), 300); }} bind:this={button_ref}><i class="fa-solid fa-plus mr-2 float-right"></i>Přidat tým</button>
			<button disabled={teams.length !== 32 || $page.data.settings?.initialized} class="inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700" type="button" on:click={() => { prepare_matches();  }}><i class="fa-solid fa-play mr-2 float-right"></i>Spustit losování</button>
		</div>
	</div>
	{#if $page.data.session?.user}
	<div class="flex justify-end">
		
		{#if form_visible}
		<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
			<div class="bg-white rounded-xl p-8 w-[32rem]" in:fly="{{ y: -10, delay: 200, duration: 200 }}" out:fly="{{ y: -10, duration: 200 }}">
				<h2 class="text-2xl font-bold mb-4">{#if $team.id}Upravit{:else}Nový{/if} Tým</h2>
				<form action="?/{form_action}" method="POST" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					// `formElement` is this `<form>` element
					// `formData` is its `FormData` object that's about to be submitted
					// `action` is the URL to which the form is posted
					// calling `cancel()` will prevent the submission
					// `submitter` is the `HTMLElement` that caused the form to be submitted
			
					return async ({ result, update }) => {
						// `result` is an `ActionResult` object
						// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
						//console.log('Team: form/create', result);
						form_visible = false;
						await update();
						team.set({});
						await fetchTeams();
						button_ref?.focus();
					};
				}}
				>
					<div class="mb-4">
						<label for="name" class="block text-gray-700 text-sm font-bold mb-2">Název týmu</label>
						<input type="text" id="name" bind:value={$team.name} name="name" class="w-full border rounded-lg p-1" bind:this={input_ref}>
					</div>
					<div class="mb-4">
						<label for="player1" class="block text-gray-700 text-sm font-bold mb-2">Hráč č.1</label>
						<input type="text" id="player1" bind:value={$team.player1} name="player1" class="w-full border rounded-lg p-1">
					</div>
					<div class="mb-4">
						<label for="player2" class="block text-gray-700 text-sm font-bold mb-2">Hráč č.1</label>
						<input type="text" id="player2" bind:value={$team.player2} name="player2" class="w-full border rounded-lg p-1">
					</div>
					<div class="mb-4">
						<label for="note" class="block text-gray-700 text-sm font-bold mb-2">Poznámka</label>
						<textarea id="note" bind:value={$team.note} name="note" class="w-full border rounded-lg p-1"></textarea>
					</div>
					<div class="mb-4">
						<label for="paid" class="flex text-gray-700 text-sm font-bold mb-2">
							<input type="checkbox" id="paid" bind:checked={$team.paid} name="paid" class="mr-2">
							<span>Zaplaceno</span>
						</label>
					</div>
					<div class="flex justify-end">
						<input type="hidden" name="id" bind:value={$team.id}><!-- if used with value then it assigns 'undefined' so need bind:value-->
						<input type="hidden" name="event" value="{$page.params.event}">
						<button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl">{ #if form_action === 'create' }Vytvořit{ :else }Upravit{ /if }</button>
						<button class="ml-2" type="button" on:click={() => (form_visible = false)}>Zrušit</button>
					</div>
				</form>
			</div>
		</div>
		{/if}
	</div>
	{/if}
	<div class="w-[900px] rounded-xl overflow-hidden">
		<div class="grid grid-cols-[40px_minmax(200px,_1fr)_minmax(200px,_1fr)_80px_80px]">
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">#</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">Jméno týmu</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">Jména hráčů</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">Zaplaceno</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 radius-rt b">&nbsp;</div>
		</div>
		{#each teams as team, idx}
		<div class="grid grid-cols-[40px_minmax(200px,_1fr)_minmax(200px,_1fr)_80px_80px] bg-primary-100 pointer">
			<div class="flex items-center justify-center h-8 border-bottom">{idx + 1}</div>
			<div class="flex items-center justify-center h-8 border-bottom">{team.name}</div>
			<div class="flex items-center justify-center h-8 border-bottom">{team.player1} | {team.player2}</div>
			<div class="flex items-center justify-center h-8 border-bottom"><input type="checkbox" checked={team.paid} disabled="disabled"></div>
			<div class="flex items-center justify-center h-8 border-bottom">
				<button on:click={() => edit_team(team.id)}><i class="fa-solid fa-pencil mr-4"></i></button>
				<Confirm confirmTitle="Smazat" cancelTitle="Zrušit" let:confirm="{showModal}">
					<button on:click={() => showModal(delete_team, team.id)}><i class="fa-solid fa-trash text-red-500"></i></button>
					<span slot="title">Smazat tým?</span>
					<span slot="description">Smazání týmu nelze vrátit!</span>
				</Confirm>
			</div>
		</div>
		{/each}
		<div class="radius-lb radius-rb h-2 bg-primary-200"></div>
	</div>
</div>
