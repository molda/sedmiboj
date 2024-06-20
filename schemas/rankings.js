NEWSCHEMA('Rankings', function(schema) {

	schema.setRead(function($) {

        var { eventid } = $.query;
        if (!eventid)
            return $.invalid('NOEVENTID');

        var rankings = CACHE('rankings');
        if (rankings?.length) {
            console.log('Reading from cache', rankings.length);
            $.callback(rankings);
            return;
        }

        NOSQL('teams_' + eventid).find().sort('id').callback((err, teams, meta) => {
            if (err)
                return $.invalid('error');
           
            var builder = NOSQL('matches_' + eventid).find();
            builder.callback((err, matches, meta) => {

                if (err)
                    return $.invalid('error');
               
                var data = createStructure(teams);
                for (let i = 0; i < data.length; i++) {
                    data[i] = fillPoints(data[i], matches)
                }
                
                //console.log('responding');
                $.callback(data);
                console.log('Saving to cache');
                CACHE('rankings', data, '5 seconds');
            });                
        });


	});

});

var points = [0, 2, 3, 4, 5, 7, 9]; // null pro posunutí indexu, 0 --> 0 bodů za boj o 3 místo

function createStructure(teams) {
    var tmp = [];
    teams.forEach(t => {
        tmp.push({ id: t.id, team: t, wins: 0, total: 0, scores: { tennis: 0, pingpong: 0, football: 0, voleyball: 0, basketball: 0, handball: 0, netball: 0 }});
    });
    return tmp;
};

// add 1 for each won match
function fillPoints(team, matches) {
    var active = matches.filter(m => (m.team1 === team.id || m.team2 === team.id) && m.active);
    var teamMatches = matches.filter(m => (m.team1 === team.id || m.team2 === team.id) && m.closed === true);
    //console.log('fillPoints', team.id, teamMatches.length);
    
    teamMatches.forEach(match => {
        // tým není vítěz takže dostane body za zápas v předchozím kole
        var iswinner = match.winner === team.id;
        if (match.round === 6) {
            if (iswinner) {
                team.scores[match.category] = 9;
                team.total += 9;
                team.wins += 1;
            } else {
                team.scores[match.category] = 7;
                team.total += 7;
            }
            return;
        }

        if (match.round === 5) {
            if (iswinner) {
                team.scores[match.category] = 5;
                team.total += 5;
                team.wins += 1;
            } else {
                team.scores[match.category] = 4;
                team.total += 4;
            }
            return;
        }
        
        if (match.round === 4) {
            if (!iswinner) {
                //team.scores[match.category] = 3;
                //team.total += 3;
            } else
                team.wins += 1;
            return;
        }

        if (match.round === 3) {
            if (!iswinner) {
                team.scores[match.category] = 3;
                team.total += 3;
            } else
                team.wins += 1;
            return;
        }

        if (match.round === 2) {
            if (!iswinner){
                team.scores[match.category] = 2;
                team.total += 2;
            } else
                team.wins += 1;
            return;
        }

        // round 1
        if (iswinner)
            team.wins += 1;
    });
    if (active.length) {
        //console.log(team.id, 'active', active[0]);
        team.active = active[0].category; // team právě hraje
    }

    //console.log('Team wins', team.wins);

    //total && console.log('Team', team.id, team.scores);
    return team;
}