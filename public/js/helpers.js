
Thelpers.player1 = function(team) {
    team = common.teams.findItem('id', team);
    return (team && team.player1) || '---';
};

Thelpers.player2 = function(team) {
    team = common.teams.findItem('id', team);
    return (team && team.player2) || '---';
};

Thelpers.player_names = function(team) {
    team = common.teams.findItem('id', team);
    if (!team)
        return '---';
    if (!team.player1 || !team.player2)
        return team.name;
    return team.player1 + ' / ' + team.player2;
};

Thelpers.player_surnames = function(team) {
    team = common.teams.findItem('id', team);
    if (!team)
        return '---';
    if (!team.player1 || !team.player2)
        return team.name;
    var p1 = team.player1.split(' ');
    var p2 = team.player2.split(' ');
    return (p1[1] || p1[0]) + ' / ' + (p2[1] || p2[0]);
};

Thelpers.player_names_not_winner = function(match) {
    var { winner, team1, team2 } = match;
    if (!winner)
        return '---';
    var team = winner === team1 ? team2 : team1;
    team = common.teams.findItem('id', team);
    if (!team.player1 || !team.player2)
        return team.name;
    return team.player1 + ' / ' + team.player2;
};

Thelpers.teamname = function(team) {
    var team = common.teams.findItem('id', team);
    //console.log('TEAM teamname', team);
    if (!team)
        return '---';
    if (team.name)
        return team.name;
    return team.player1 + ' / ' + team.player2;
};

Thelpers.category = function(category) {
    return category ? common.categories[category] : '';
};

Thelpers.category_icon = function(category) {
    return category ? common.icons[category] : '';
};

Thelpers.is_playing = function(match, team) {
    if (match.active)
        return '';
    var categories = Object.keys(common.matches);
    var team = match[team];
    for (let category of categories) {
        var active = common.matches[category].some(match => match.active && (match.team1 === team || match.team2 === team));
        if (active)
            return '<i class="far fa-running playing text-theme"></i>';
    }
    return '';
};

Thelpers.isadmin = function(cls) {
    if (user?.admin)
        return cls;
    return '';
};

