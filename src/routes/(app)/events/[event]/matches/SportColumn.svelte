<script>
    import { page } from '$app/stores';
    export let matches;
    export let sport;
    export let teams;
    let data;

    //console.log('PAGE', $page.data);

    function getTeamName(teamid) {
        var team = teams.find(t => t.id === teamid);
        //console.log(teamid, team);
        let name = 'N/A';
        if (!team?.player1 || !team?.player2)
            name = team?.name || '...';
        else
            name = `${team.player1} & ${team.player2}`;
        return name;
    }

</script>
<div class="h-full flex flex-col">
    <div class="b p-2 text-white flex justify-between align-center">
        <div><i class="fa fa- mr-2"></i>{sport}</div>
        <!-- <div>Zbývá: </div> -->
    </div>
    {#each matches as match, idx}
    <div class="p-2">
        <div class="shadow bg-primary rounded p-1">
            <div class="flex justify-between">
                {#if match.active}
                <div class="mb-2 text-xs">Aktuální zápas: {match.match}</div>
                {:else}
                <div class="mb-1 text-sm text-gray-400">Zápas číslo: {match.match}</div>
                {/if}
            </div>
            <div class="flex justify-between text-sm">
                <div>{getTeamName(match.team1)}</div>
                <div>{match.score1}</div>
            </div>
            <div class="flex justify-between text-sm">
                <div>{getTeamName(match.team2)}</div>
                <div>{match.score2}</div>
            </div>
        </div>
    </div>
    {/each}
</div>