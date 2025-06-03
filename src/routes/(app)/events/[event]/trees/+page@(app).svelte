<script>
	import { page } from '$app/stores';
    import { treeStore } from '$lib/stores';
    import { fly } from 'svelte/transition';
	import { writable } from 'svelte/store';
    import SportsMenu from '$lib/app/components/SportsMenu.svelte';
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
                let allmatches = data2.matches.filter(match => match.sport === selected);
                let teamsActive = data2.matches.filter(match => match.status === 'active').map(match => [ match.team1, match.team2 ]).flat();
                pre_matches = fillEmptyPreliminary(allmatches.filter(match => match.preliminary)).map(match => {
                    if (!match) {
                        return null;
                    }

                    if (teamsActive.includes(match.team1)) {
                        match.team1active = true;
                    }

                    if (teamsActive.includes(match.team2)) {
                        match.team2active = true;
                    }

                    return match;
                });
                pre_matches_visible = pre_matches.length > 0 && pre_matches.some(match => match && match.status !== 'closed');

                allmatches = allmatches.filter(match => !match.preliminary);
                matches = allmatches.map(match => {
                    if (teamsActive.includes(match.team1)) {
                        match.team1active = true;
                    }

                    if (teamsActive.includes(match.team2)) {
                        match.team2active = true;
                    }

                    return match;
                });

                console.log('Matches', matches);
                loading(false);
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

    function updateMatch(id) {
        //console.log('updateMatch', id);
        if (!$page.data.session?.user)
            return;
        var match2 = (id.includes('_prelim_') ? pre_matches : matches).find(match => match?.id === id);
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
        console.log('winner', id);
        loading();
        fetch(`/api/events/${$page.params.event}/matches/${$match.id}/winner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner: id, sport: $match.sport, match: $match.match, status: 'closed', team1: $match.team1, team2: $match.team2, preliminary: $match.preliminary })
        })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            form_visible = false;
            loadMatches();
            sendMessage({ topic: 'matches/refresh', message: '' });
            loading(false);
        });
    }

    function startMatch(match) {
        if (!$page.data.session?.user)
            return;

        // if (matches.find(m => m.status === 'active'))
        //     return;
        //console.log('winner', id);
        loading();
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
            loading(false);
        });
    };

    function cancelMatch(match) {
        if (match.status !== 'active')
            return;

        loading();

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
            loading(false);
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
<div class="h-screen w-full relative">
	<Loading visible={isLoading}/>
    <SportsMenu></SportsMenu>
    <div class="flex h-screen w-full">
        {#if matches.length > 0}
        <div class="flex flex-row p-2 w-full">
            {#if pre_matches.length > 0 && pre_matches_visible}
            <div class="flex flex-row w-[18%]">
                <div class="flex flex-col w-full">
                    {#each pre_matches as match}
                    {#if match}
                    <div class="flex mx-2">
                        <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                            <div class="flex flex-col w-full">
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {:else}
                    <div class="flex mx-2 h-[66px]"></div>
                    {/if}
                    {/each}
                </div>
            </div>
            {/if}
            {#if pre_matches.length > 0}
            <div class="w-[2%] flex justify-center items-center cursor-pointer bg-slate-100 rounded-xl" on:click={() => { console.log('Prematch click'); pre_matches_visible = !pre_matches_visible; } }>
                {#if pre_matches_visible}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z"/></svg>
                {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z"/></svg>
                {/if}
            </div>
            {/if}
            <div class="flex flex-row flex-grow">
                <div class="flex flex-col w-[20%] justify-between">
                    {#each matches as match}
                    {#if match && match.round === 1 }
                    <div class="flex mx-2">
                        <div class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                            <div class="flex flex-col w-full">
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
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
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
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
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
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
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm flex flex-inline items-center">{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
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
                    {#if match && match.match === 31}
                    <div class="flex mx-2 absolute" style="left:-90%;width:calc(100% - 64px);">
                        <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                            <div class="flex flex-col w-full">
                                <div class="flex justify-between items-center">
                                    <div class="text-sm">{#if match.status !== 'closed'}&nbsp;{:else if match.winner && match.winner === match.team1}<b>3.&nbsp;</b>{:else}<b>4.&nbsp;</b>{/if}{#if !match.status && match.team1active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm">{#if match.status !== 'closed'}&nbsp;{:else if match.winner && match.winner === match.team2}<b>3.&nbsp;</b>{:else}<b>4.&nbsp;</b>{/if}{#if !match.status && match.team2active}<Icon icon="mdi:run-fast" class="h-4 w-4 mr-2" />{/if}{@html teamName(match.team2)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/if}
                    {#if match && match.match === 32 }
                    <div class="flex mx-2">
                        <div  class={ `shadow border border-slate-200 w-full px-2 py-1 rounded-xl pointer mb-2 flex exec ` + classes(match.status) } on:click={ updateMatch(match.id) } role="button">
                            <div class="flex flex-col w-full">
                                <div class="flex justify-between items-center">
                                    <div class="text-sm">{#if match.status !== 'closed'}&nbsp;{:else if match.winner && match.winner === match.team1}<b>1.&nbsp;</b>{:else}<b>2.&nbsp;</b>{/if}{@html teamName(match.team1)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team1}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="text-sm">{#if match.status !== 'closed'}&nbsp;{:else if match.winner && match.winner === match.team2}<b>1.&nbsp;</b>{:else}<b>2.&nbsp;</b>{/if}{@html teamName(match.team2)}</div>
                                    <div class="flex items-center">{#if match.winner && match.winner === match.team2}<img src="/svgs/cup.svg" alt="cup.svg">{/if}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/if}
                    {/each}
                </div>
            </div>
        </div>
        {:else}
        <div class="w-full flex justify-center items-center">
            <h2 class="text-gray-400 text-xl">Tady není nic k vidění. Postupujte dál, prosím.</h2>
        </div>
        {/if}
    </div>
</div>

{#if form_visible}
<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center" on:click={() => (form_visible = false)}>
    <div class="bg-white rounded-xl p-8 w-[20rem]" in:fly="{{ y: -10, delay: 200, duration: 200 }}" out:fly="{{ y: -10, duration: 200 }}">
        <div class="flex flex-col">
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl" class:hidden={ $match.status === 'active' || $match.status === 'closed' } on:click={ () => startMatch($match) }>Zahájit zápas</button>
            <div class="flex items-center my-4">
                <div class="flex-grow border-t border-gray-400"></div>
                <span class="mx-4 text-gray-600">{#if $match.status !== 'active' && $match.status !== 'closed' }NEBO {/if}ZVOLTE VÍŤEZE</span>
                <div class="flex-grow border-t border-gray-400"></div>
            </div>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-2" on:click={ () => winner($match.team1) }>{$match.team1_name}</button>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-4" on:click={ () => winner($match.team2) }>{$match.team2_name}</button>
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl mb-2" class:hidden={ $match.status !== 'active' } on:click={ () => cancelMatch($match) }>Zrušit zápas</button>
        </div>
        <div class="flex justify-center">
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold pt-3 px-4" type="button" on:click|stopPropagation={() => (form_visible = false)}>Zrušit</button>
        </div>
    </div>
</div>
{/if}
