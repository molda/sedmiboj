<script>
    import { page } from '$app/stores';
    export let matches;
    export let sport;
    export let teams;
    let data;

    var sport_data = $page.data.sports.find(s => s.id === sport);

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

    function getIcon(sport) {
        var s = $page.data.sports.find(s => s.id === sport);
        return s.icon ? `<i class="${s.icon}"></i>` : s.svg;
    };

</script>
<div class="h-full flex flex-col">
    <div class="b p-2 flex justify-between align-center">
        <div class="flex items-center">{@html getIcon(sport) }&nbsp;{sport_data.name}</div>
        <!-- <div>Zbývá: </div> -->
    </div>
    {#each matches as match, idx}
    <div class="p-2">
        <div class={ `shadow rounded p-1 ` + classes(match.status) }>
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