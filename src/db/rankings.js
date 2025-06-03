import { getDB } from '$db/mongo';
const db = getDB();

export const queryRankings = async (filter = {}, opt = { orderby: 'wins' }) => {
    const matches = await db.collection('matches').find(filter).project({ _id: 0 }).toArray();
    const teams = await db.collection('teams').find(filter).project({ _id: 0 }).toArray();
    console.log('queryRankings', { filter });

    var data = createStructure(teams);
    for (let i = 0; i < data.length; i++) {
        data[i] = fillPoints(data[i], matches.filter(m => m.team1 === data[i].id || m.team2 === data[i].id));
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
// Za vyhru dostane tým body podle kola, ve kterém vyhrál.
//  první kolo 2
//  druhé kolo 1
//  třetí kolo 1
//  čtvrté kolo 2
//  páté kolo (3-4 místo) 0 a 1
//  šesté kolo (1-2 místo) 1 a 3
function createStructure(teams) {
    var tmp = [];
    teams.forEach(t => {
        tmp.push({ id: t.id, team: t, wins: 0, total: 0, scores: { tenis: 0, pingpong: 0, fotbal: 0, volejbal: 0, basketbal: 0, hazena: 0, nohejbal: 0 }});
    });
    return tmp;
};

// add 1 for each won match
function fillPoints(team, matches) {
    var active = matches.filter(m => m.status === 'active');
    var wonMatches = matches.filter(m => m.status === 'closed' && m.winner === team.id && m.round < 5);
    var finalMatches = matches.filter(m => m.status === 'closed' && m.round >= 5);
    
    if (team.id === 'team34')
        console.log('fillPoints', team.id, active, matches);

    wonMatches.forEach(match => {
        switch (match.round) {
            case 1:
                team.scores[match.sport] += 2;
                team.total += 2;
                team.wins += 1;
                break;
            case 2:
                team.scores[match.sport] += 1;
                team.total += 1;
                team.wins += 1;
                break;
            case 3:
                team.scores[match.sport] += 1;
                team.total += 1;
                team.wins += 1;
                break;
            case 4:
                team.scores[match.sport] += 3;
                team.total += 3;
                team.wins += 1;
                break;
        }
    });

    finalMatches.forEach(match => {
        if (match.match === 31) {
            if (match.winner === team.id) {
                team.scores[match.sport] += 1;
                team.total += 1;
                team.wins += 1;
            }
        } else if (match.match === 32) {	
            if (match.winner === team.id) {
                team.scores[match.sport] += 2;
                team.total += 2;
                team.wins += 1;
            }
        }
    });
    
    if (active.length) {
        //console.log(team.id, 'active', active[0]);
        team.active = active[0].sport; // team právě hraje
    }

    //console.log('Team wins', team.wins);

    //console.log('Team', team.id, team.scores);
    return team;
}