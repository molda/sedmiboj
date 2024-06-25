<script>
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import Icon from '@iconify/svelte';
    import { message, sendMessage } from '../ws.js';

	export let data;

    let rankings = data.rankings;
	let orderby = 'wins'; // total, wins
	let orderbyTitle = 'bodů'; // bodů, výher

	function refresh() {
		fetch(`/api/events/${$page.params.event}/rankings?orderby=${orderby}`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data => {
				rankings = data.rankings.sort((a, b) => b[orderby] - a[orderby]);
				console.log('fetchRankings', data);
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
		if (team.player1 && team.player2)
			return `${team.player1} & ${team.player2}`;	
		return team.name;
	}

	function toggleOrderby() {
		if (orderby === 'wins') {
			orderby = 'total';
			orderbyTitle = 'výher'; // obrácený text
		} else {
			orderby = 'wins';
			orderbyTitle = 'bodů'; // obrácený text
		}
		rankings = rankings.slice().sort((a, b) => b[orderby] - a[orderby]);
	}

</script>

<div class="p-4">
	<div class="flex justify-between mb-2">
		<h1 class="text-4xl font-bold mb-2">Aktuální pořadí</h1>
		<div class="flex items-center">
			<button type="button" on:click={() => toggleOrderby()} class="inline-flex mr-2 justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700"><Icon icon="mdi:sort" class="h-6 w-6 mr-2" />Seřadit podle {orderbyTitle}</button>
			<button type="button" on:click={() => refresh()} class="inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700"><Icon icon="mdi:refresh" class="h-6 w-6 mr-2" />Obnovit</button>
		</div>
	</div>

	<div class="w-full rounded-xl overflow-hidden">
		<div class="grid grid-cols-[60px_minmax(300px,_1fr)_repeat(7,_90px)_100px_120px] bg-primary-200">
		    <div class="flex items-center justify-center h-10 radius-lt font-bold">Pořadí</div>
            <div class="flex items-center justify-center h-10 font-bold">Jméno týmu</div>
            <div class="flex items-center justify-center h-10">Tenis</div>
            <div class="flex items-center justify-center h-10">Pingpong</div>
            <div class="flex items-center justify-center h-10">Fotbal</div>
            <div class="flex items-center justify-center h-10">Volejbal</div>
            <div class="flex items-center justify-center h-10">Basketbal</div>
            <div class="flex items-center justify-center h-10">Házená</div>
            <div class="flex items-center justify-center h-10">Nohejbal</div>
            <div class="flex items-center justify-center h-10" class:font-bold={orderby === 'wins'}>Výhry</div>
            <div class="flex items-center justify-center h-10 radius-rt" class:font-bold={orderby === 'total'}>Počet bodů</div>
        </div>
		{#each rankings as team, idx}
		<div class="grid grid-cols-[60px_minmax(300px,_1fr)_repeat(7,_90px)_100px_120px] bg-primary-100 pointer" class:bg-primary-200={idx % 2 !== 0}>
			<div class="flex align-center justify-end h-7">{idx + 1}.</div>
			<div class="flex align-center justify-center h-7">{teamName(team.team)}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'tennis' }>{team.scores.tennis}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'pingpong' }>{team.scores.pingpong}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'football' }>{team.scores.football}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'voleyball' }>{team.scores.voleyball}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'basketball' }>{team.scores.basketball}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'handball' }>{team.scores.handball}</div>
			<div class="flex align-center justify-center h-7" class:bg-theme={ team.active === 'netball' }>{team.scores.netball}</div>
			<div class="flex align-center justify-center h-7" class:font-bold={orderby === 'wins'}>{team.wins}</div>
			<div class="flex align-center justify-center h-7" class:font-bold={orderby === 'total'}>{team.total}</div>
		</div>
		{/each}
		<div class="radius-lb radius-rb h-2 bg-primary-200"></div>
	</div>
</div>
