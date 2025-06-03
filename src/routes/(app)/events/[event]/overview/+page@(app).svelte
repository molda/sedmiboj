<script>
	import { page } from '$app/stores';
    import { treeStore } from '$lib/stores';
	import { writable } from 'svelte/store';
	import { onMount, onDestroy } from 'svelte';
    import { message, sendMessage } from '../ws.js';
	import Loading from '$lib/components/Loading.svelte';
	import Icon from '@iconify/svelte';

	//export let data;
    let selected;
    let matches = [];
    let pre_matches = [];
    let form_visible = false;
	let match = writable({});
    let unsubscribe;
    let pre_matches_visible = false;
	let isLoading = false;

    onMount(() => {


        unsubscribe = message.subscribe(({ topic, message }) => {
            if (topic === 'matches/refresh')
                loadMatches();

            console.log('message', { topic, message });
        });

        //sendMessage({ topic: 'subscribe', message: 'trees' });

        console.log($page.data);
    });

    onDestroy(() => {
        unsubscribe?.();
    });

    function loading(is) {
        if (is === false)
            setTimeout(() => (isLoading = false), 300);
        else
        isLoading = true;
    };

    function loadMatches() {
        loading();
		fetch(`/api/events/${$page.params.event}/matches`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data2 => {
                // let allmatches = data2.matches;
                // let teamsActive = data2.matches.filter(match => match.status === 'active').map(match => [ match.team1, match.team2 ]).flat();
                // pre_matches = fillEmptyPreliminary(allmatches.filter(match => match.preliminary)).map(match => {
                //     if (!match) {
                //         return null;
                //     }

                //     if (teamsActive.includes(match.team1)) {
                //         match.team1active = true;
                //     }

                //     if (teamsActive.includes(match.team2)) {
                //         match.team2active = true;
                //     }

                //     return match;
                // });
                // pre_matches_visible = pre_matches.length > 0 && pre_matches.some(match => match && match.status !== 'closed');

                // allmatches = allmatches.filter(match => !match.preliminary);
                // matches = allmatches.map(match => {
                //     if (teamsActive.includes(match.team1)) {
                //         match.team1active = true;
                //     }

                //     if (teamsActive.includes(match.team2)) {
                //         match.team2active = true;
                //     }

                //     return match;
                // });

                // console.log('Matches', matches);
                // loading(false);
			});
	}

    function fillEmptyPreliminary(preliminary) {
        preliminary.sort((a, b) => b.match - a.match);
        let matches = new Array(16);
        preliminary.forEach(pre => {
            let nextMatchIndex = Math.abs(pre.match);
            matches[nextMatchIndex] = pre;
        });
        return matches;
    }

    function teamName(id) {
        if (!id) return '&nbsp;';

        var team = $page.data.teams.find(team => team.id === id);

        if (!team.name && !team.player1 && !team.player2)
            return ('<neobsazeno>').replace('<', '&lt;').replace('>', '&gt;');
        
        return '<span>' + (team.name || (team.player1 + ' | ' + team.player2)).replace('<', '&lt;').replace('>', '&gt;') + '</span>';
    }

    function classes(status) {
        switch (status) {
            case 'active':
                return 'bg-primary-700 text-white';
            case 'closed':
                return 'bg-slate-200';
            default:
                return '';
        }
    };
</script>

<!-- svelte-ignore a11y-interactive-supports-focus -->
<div class="h-screen w-full relative">
	<Loading visible={isLoading}/>
    <div class="flex h-screen w-full">

        <div class="w-full flex justify-center items-center">
            <h2 class="text-gray-400 text-xl">Tady není nic k vidění. Postupujte dál, prosím.</h2>
        </div>

    </div>
</div>
