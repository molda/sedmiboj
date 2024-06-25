<script>
	import { page } from '$app/stores';

	export let data;
    export let matches = data.matches || [];
    
    let sport = $page.data.sports.find(s => s.id === $page.params.sport);

    //console.log('DATA.....', data);

	function refresh() {
		fetch(`/api/events/${$page.params.event}/${$page.params.sport}/matches`, { headers: { Accept: 'application/json' }})
			.then(res => res.json())
			.then(data => {
				matches = data.matches;
			});
	}

    page.subscribe(data => {
        sport = $page.data.sports.find(s => s.id === $page.params.sport);
    });

</script>

<div class="px-4 h-full w-full relative">
    <div class="flex justify-between items-center p-4">
        <div></div>
        <h2 class="text-gray-600 font-bold text-xl mr-4">{sport.name}</h2>
        <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl disabled:opacity-50 disabled:hover:bg-primary-700"><i class="fa fa-refresh"></i></button>
    </div>
       
    <div class="flex">
        <div class="flex flex-column w-[20%]">
            {#each matches as match}
            {#if match &&match.round === 1 }
            <div class="flex mx-2">
                <div class="shadow w-full bg-primary p-2 radius pointer mb-2 flex exec">
                    <div class="flex flex-column w-full">
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team1}</div>
                            <div><i class="far fa-check"></i></div>
                        </div>
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team2}</div>
                            <div><i class="far fa-check"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-column w-[20%] space-around">
            {#each matches as match}
            {#if match.round === 2 }
            <div class="flex mx-2">
                <div class="shadow w-full bg-primary p-2 radius pointer mb-2 flex exec">
                    <div class="flex flex-column w-full">
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team1}</div>
                            <div>{match.score1}</div>
                        </div>
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team2}</div>
                            <div>{match.score2}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-column w-[20%] space-around">
            {#each matches as match}
            {#if match.round === 3 }
            <div class="flex mx-2">
                <div class="shadow w-full bg-primary p-2 radius pointer mb-2 flex exec">
                    <div class="flex flex-column w-full">
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team1}</div>
                            <div>{match.score1}</div>
                        </div>
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team2}</div>
                            <div>{match.score2}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-column w-[20%] space-around">
            {#each matches as match}
            {#if match.round === 4 }
            <div class="flex mx-2">
                <div class="shadow w-full bg-primary p-2 radius pointer mb-2 flex">
                    <div class="flex flex-column w-full">
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team1}</div>
                            <div>{match.score1}</div>
                        </div>
                        <div class="flex space-between align-center">
                            <div class="font-sm">{match.team2}</div>
                            <div>{match.score2}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            {/each}
        </div>
        <div class="flex flex-column w-[20%] space-around">
            <div class="flex mx-2">
                {#each matches as match}
                {#if match.round === 5 }
                <div class="flex mx-2">
                    <div class="shadow w-full bg-primary p-2 radius pointer mb-2 flex">
                        <div class="flex flex-column w-full">
                            <div class="flex space-between align-center">
                                <div class="font-sm">{match.team1}</div>
                                <div>{match.score1}</div>
                            </div>
                            <div class="flex space-between align-center">
                                <div class="font-sm">{match.team2}</div>
                                <div>{match.score2}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/if}
                {/each}
            </div>
        </div>
    </div>
    {#if matches.length === 0}
    <div class="flex justify-center items-center">
        <h2 class="text-gray-400 text-xl">Tady není nic k vidění. Postupujte dál, prosím.</h2>
    </div>
    {/if}
</div>
