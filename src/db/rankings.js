import { getDB } from '$db/mongo';
const db = getDB();

export const queryRankings = async (filter = {}, opt = { orderby: 'wins' }) => {
    const matches = await db.collection('matches').find(filter).project({ _id: 0 }).toArray();
    const teams = await db.collection('teams').find(filter).project({ _id: 0 }).toArray();
    //console.log('queryRankings', { filter });

    var data = createStructure(teams);
    for (let i = 0; i < data.length; i++) {
        data[i] = fillPoints(data[i], matches)
    }
    if (!data) {
        return { rankings: [] };
    }

    data.sort((a, b) => {
        if (opt.orderby === 'wins') {
            // if (a.wins === b.wins) {
            //     return b.total - a.total;
            // }
            return b.wins - a.wins;
        }

        if (opt.orderby === 'points') {
            // if (a.total === b.total) {
            //     return b.wins - a.wins;
            // }
            return b.total - a.total;
        }
    });

    return { rankings: data, matches };
}

//var points = [0, 2, 3, 4, 5, 7, 9]; // null pro posunutí indexu, 0 --> 0 bodů za boj o 3 místo

function createStructure(teams) {
    var tmp = [];
    teams.forEach(t => {
        tmp.push({ id: t.id, team: t, wins: 0, total: 0, scores: { tennis: 0, pingpong: 0, football: 0, voleyball: 0, basketball: 0, handball: 0, netball: 0 }});
    });
    return tmp;
};

// add 1 for each won match
function fillPoints(team, matches) {
    var active = matches.filter(m => (m.team1 === team.id || m.team2 === team.id) && m.status === 'active');
    var teamMatches = matches.filter(m => (m.team1 === team.id || m.team2 === team.id) && m.status === 'closed');
    console.log('fillPoints', team.id, teamMatches);
    
    teamMatches.forEach(match => {
        // tým není vítěz takže dostane body za zápas v předchozím kole
        var iswinner = match.winner === team.id;
        if (match.round === 6) {
            if (iswinner) {
                team.scores[match.sport] = 9;
                team.total += 9;
                team.wins += 1;
            } else {
                team.scores[match.sport] = 7;
                team.total += 7;
            }
            return;
        }

        if (match.round === 5) {
            if (iswinner) {
                team.scores[match.sport] = 5;
                team.total += 5;
                team.wins += 1;
            } else {
                team.scores[match.sport] = 4;
                team.total += 4;
            }
            return;
        }
        
        if (match.round === 4) {
            if (!iswinner) {
                //team.scores[match.sport] = 3;
                //team.total += 3;
            } else
                team.wins += 1;
            return;
        }

        if (match.round === 3) {
            if (!iswinner) {
                team.scores[match.sport] = 3;
                team.total += 3;
            } else
                team.wins += 1;
            return;
        }

        if (match.round === 2) {
            if (!iswinner){
                team.scores[match.sport] = 2;
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
        team.active = active[0].sport; // team právě hraje
    }

    //console.log('Team wins', team.wins);

    console.log('Team', team.id, team.scores);
    return team;
}