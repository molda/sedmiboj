<script>
	import { page } from '$app/stores';
    import SportColumn from './SportColumn.svelte';
	import { onMount, onDestroy } from 'svelte';
    import { message, sendMessage } from '../ws.js';

	export let data;

    let matches = data.matches;
    let settings = data.settings;
    let teams = data.teams;

    console.log('DATA.....', settings);

	function refresh() {
		fetch(`/api/events/${$page.params.event}/matches`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data => {
				matches = separateMatches(data.matches);
			});
	}

    let unsubscribe;

    onMount(() => {

        unsubscribe = message.subscribe(({ topic, message }) => {
            if (topic === 'matches/refresh')
                refresh();

            console.log('message', { topic, message });
        });
    });

    onDestroy(() => {
        unsubscribe?.();
    });

    // a function to separate matches into multiple arrays based on sport and order by match number
    // return an object with sport as key and array of matches as value
    function separateMatches(arr) {
        let sports = {};
        arr.forEach(match => {
            if (!sports[match.sport]) sports[match.sport] = [];
            sports[match.sport].push(match);
        });
        for (let sport in settings.sports) {
            sports[sport] = sports[sport].sort((a, b) => a.match - b.match);
        }
        return sports;
    }

    function toggleClosed() {
        let closed = false;
        return function() {
            closed = !closed;
            matches = data.matches.filter(m => closed ? m.status === 'closed' : true);
            console.log('MATCHES', matches);
        }
    }

</script>

<div class="p-4 h-full w-full overflow-y-scroll">
    <div class="flex justify-between align-center mb-4 mt-4">
        <h2>Probíhající zápasy</h2>
        <button class="btn btn-primary" on:click={toggleClosed()}><i class="fa fa-eye mr-2"></i>Zobrazit/skrýt odehrané zápasy</button>
    </div>
    <div class="grid grid-cols-7">
        {#each settings.sports as sport, idx}
        <SportColumn teams={teams} sport={sport} matches={matches.filter(m => m.sport === sport)} />
        {/each}
    </div>
</div>
