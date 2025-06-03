<script>
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import Icon from '@iconify/svelte';
    import { message, sendMessage } from '../ws.js';
	import Loading from '$lib/components/Loading.svelte';
	export let data;
	
	let isLoading = false;
    let rankings = data.rankings;

	function loading(is) {
        if (is === false)
            setTimeout(() => (isLoading = false), 300);
        else
        isLoading = true;
    };

	function refresh() {
		loading(true);
		fetch(`/api/events/${$page.params.event}/rankings`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data => {
				rankings = data.rankings.sort((a, b) => b.total - a.total);
				//console.log('fetchRankings', data);
				loading(false);
			});
	}

	let unsubscribe;

	onMount(() => {
		refresh();

		unsubscribe = message.subscribe(({ topic, message }) => {
			if (topic === 'matches/refresh')
				setTimeout(() => refresh(), 1000);

			//console.log('message', { topic, message });
		});

		//sendMessage({ topic: 'subscribe', message: 'trees' });
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	function teamName(team) {
		if (!team.name && !team.player1 && !team.player2)
			return ('<neobsazeno>').replace('<', '&lt;').replace('>', '&gt;');
		
		return (team.name || (team.player1 + ' | ' + team.player2)).replace('<', '&lt;').replace('>', '&gt;');
	}

</script>

<div class="p-4">
	<div class="flex justify-between mb-2">
		<h1 class="text-4xl font-bold mb-2">Aktuální pořadí</h1>
		<div class="flex items-center">
			<button type="button" on:click={() => refresh()} class="inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700"><Icon icon="mdi:refresh" class="h-6 w-6 mr-2" />Obnovit</button>
		</div>
	</div>

	<div class="flex justify-center">
		<div class="container rounded-xl overflow-hidden relative">
			<Loading visible={isLoading}/>
			<div class="grid grid-cols-[60px_minmax(200px,_1fr)_repeat(7,_90px)_120px] bg-primary-200">
				<div class="flex items-center justify-center h-10 radius-lt font-bold">Pořadí</div>
				<div class="flex items-center justify-center h-10 font-bold">Jméno týmu</div>
				<div class="flex items-center justify-center h-10">Tenis</div>
				<div class="flex items-center justify-center h-10">Pingpong</div>
				<div class="flex items-center justify-center h-10">Fotbal</div>
				<div class="flex items-center justify-center h-10">Volejbal</div>
				<div class="flex items-center justify-center h-10">Basketbal</div>
				<div class="flex items-center justify-center h-10">Házená</div>
				<div class="flex items-center justify-center h-10">Nohejbal</div>
				<!-- <div class="flex items-center justify-center h-10">Výhry</div> -->
				<div class="flex items-center justify-center h-10 radius-rt font-bold">Počet bodů</div>
			</div>
			{#each rankings as team, idx}
			<div class="grid grid-cols-[60px_minmax(200px,_1fr)_repeat(7,_90px)_120px] bg-primary-100 pointer" class:bg-primary-200={idx % 2 !== 0}>
				<div class="flex align-center justify-end h-7">{idx + 1}.</div>
				<div class="flex align-center justify-center h-7">{teamName(team.team)}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'tenis' }>{team.scores.tenis}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'pingpong' }>{team.scores.pingpong}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'fotbal' }>{team.scores.fotbal}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'volejbal' }>{team.scores.volejbal}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'basketbal' }>{team.scores.basketbal}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'hazena' }>{team.scores.hazena}</div>
				<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'nohejbal' }>{team.scores.nohejbal}</div>
				<!-- <div class="flex align-center justify-center h-7">{team.wins}</div> -->
				<div class="flex align-center justify-center h-7 font-bold">{team.total}</div>
			</div>
			{/each}
			<div class="radius-lb radius-rb h-2 bg-primary-200"></div>
		</div>
	</div>
</div>
