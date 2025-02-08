<script>
	import { page } from '$app/stores';
    import { treeStore } from '$lib/stores';
    import { fly } from 'svelte/transition';
	import { writable } from 'svelte/store';
    import SportsMenu from '$lib/app/components/SportsMenu.svelte';
	import { onMount, onDestroy } from 'svelte';
    import { message, sendMessage } from '../ws.js';

	//export let data;
    let selected;
    let matches = [];
    let form_visible = false;
	let match = writable({});
    let unsubscribe;

    onMount(() => {
        //selected && loadMatches();

        treeStore.subscribe(value => {
            selected = value.selected;
            loadMatches();        
        });

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

    function loadMatches() {
		fetch(`/api/events/${$page.params.event}/matches`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data2 => {
                matches = data2.matches.filter(match => match.sport === selected);
                //console.log('LoadedMatches', matches);
			});
	}

    function teamName(id) {
        if (!id) return '&nbsp;';

        var team = $page.data.teams.find(team => team.id === id);

        if (!team.name && !team.player1 && !team.player2)
            return ('<neobsazeno>').replace('<', '&lt;').replace('>', '&gt;');
        
        return (team.name || (team.player1 + ' | ' + team.player2)).replace('<', '&lt;').replace('>', '&gt;');
    }

    function updateMatch(id) {
        //console.log('updateMatch', id);
        if (!$page.data.session?.user)
            return;
        var match2 = matches.find(match => match.id === id);
        var team1 = $page.data.teams.find(team => team.id === match2.team1);
        var team2 = $page.data.teams.find(team => team.id === match2.team2);
        if (!team1 || !team2)
            return;
        match.set({ ...match2, team1_name: team1.name, team2_name: team2.name });
        form_visible = true;
    }

    function winner(id) {
        if (!$page.data.session?.user)
            return;
        //console.log('winner', id);
        fetch(`/api/events/${$page.params.event}/matches/${$match.id}/winner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner: id, sport: $match.sport, match: $match.match, status: 'closed', team1: $match.team1, team2: $match.team2 })
        })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            form_visible = false;
            loadMatches();
            sendMessage({ topic: 'matches/refresh', message: '' });
        });
    }

    function startMatch(match) {
        if (!$page.data.session?.user)
            return;

        if (matches.find(m => m.status === 'active'))
            return;
        //console.log('winner', id);
        fetch(`/api/events/${$page.params.event}/matches/${match.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sport: match.sport, match: match.match, status: 'active' })
        })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            form_visible = false;
            loadMatches();
            sendMessage({ topic: 'matches/refresh', message: '' });
        });
    };

    function cancelMatch(match) {
        if (match.status !== 'active')
            return;

        fetch(`/api/events/${$page.params.event}/matches/${match.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sport: match.sport, match: match.match, status: '' })
        })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            form_visible = false;
            loadMatches();
            sendMessage({ topic: 'matches/refresh', message: '' });
        });
    };

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
<div class="w-full h-full relative">
    <SportsMenu></SportsMenu>
    {#if matches.length > 0}
    <div class="flex flex-row h-full p-2">
        <div class="flex flex-col w-[20%] h-full justify-between">
            {#each matches as match}
            {#if match && match.round === 1 }
            <div class="flex mx-2">
                <div class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-col w-[20%] justify-around">
            {#each matches as match}
            {#if match && match.round === 2 }
            <div class="flex mx-2">
                <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-col w-[20%] justify-around">
            {#each matches as match}
            {#if match && match.round === 3 }
            <div class="flex mx-2">
                <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-col w-[20%] justify-around">
            {#each matches as match}
            {#if match && match.round === 4 }
            <div class="flex mx-2">
                <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-col w-[20%] justify-around relative">
            {#each matches as match}
            {#if match && match.round === 5 }
            <div class="flex mx-2 absolute" style="left:-90%;width:calc(100% - 64px);">
                <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {#if match && match.round === 6 }
            <div class="flex mx-2">
                <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team1)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                        <div class="flex justify-between align-center">
                            <div class="font-sm">{@html teamName(match.team2)}</div>
                            <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
    </div>
    {:else}
    <div class="w-full flex justify-center items-center">
        <h2 class="text-gray-400 text-xl">Tady není nic k vidění. Postupujte dál, prosím.</h2>
    </div>
    {/if}
</div>

{#if form_visible}
<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
    <div class="bg-white rounded-xl p-8 w-[20rem]" in:fly="{{ y: -10, delay: 200, duration: 200 }}" out:fly="{{ y: -10, duration: 200 }}">
        <h2 class="flex justify-center text-2xl font-bold mb-4">Zvolte vítěze zápasu</h2>
        <div class="flex flex-col">
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-2" class:hidden={ $match.status === 'active' || $match.status === 'closed' || matches.find(m => m.status === 'active') } on:click={ () => startMatch($match) }>Zahájit zápas</button>
            <br>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-2" on:click={ () => winner($match.team1) }>{$match.team1_name}</button>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-4" on:click={ () => winner($match.team2) }>{$match.team2_name}</button>
            <br>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-2" class:hidden={ $match.status !== 'active' } on:click={ () => cancelMatch($match) }>Zrušit zápas</button>
        </div>
        <div class="flex justify-center">
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4" type="button" on:click={() => (form_visible = false)}>Zrušit</button>
        </div>
    </div>
</div>
{/if}
