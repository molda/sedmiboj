
Thelpers.player1 = function(team) {
    var team = common.teams.findItem('id', team);
    return (team && team.player1) || '---';
};

Thelpers.player2 = function(team) {
    var team = common.teams.findItem('id', team);
    return (team && team.player2) || '---';
};

Thelpers.player_names = function(team) {
    var team = common.teams.findItem('id', team);
    //console.log('TEAM names', team);
    if (!team)
        return '---';
    if (!team.player1 || !team.player2)
        return team.name;
    return team.player1 + ' <b>/</b> ' + team.player2;
};

Thelpers.teamname = function(team) {
    var team = common.teams.findItem('id', team);
    //console.log('TEAM teamname', team);
    if (!team)
        return '---';
    if (team.name)
        return team.name;
    return team.player1 + ' <b>/</b> ' + team.player2;
};

Thelpers.category = function(category) {
    return category ? common.categories[category] : '';
};

Thelpers.category_icon = function(category) {
    return category ? common.icons[category] : '';
};

