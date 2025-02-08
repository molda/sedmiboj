import { getDB } from '$db/mongo';
import { queryTeams } from '$db/teams';
import { getSettings, upsertSettings } from '$db/settings';
import { initializeMatches } from '$lib/matches-generator';

const db = getDB();

// 
const nextMatchForWinner = {
    // 1st round
    1: 17,
    2: 17,
    3: 18,
    4: 18,
    5: 19,
    6: 19,
    7: 20,
    8: 20,
    9: 21,
    10: 21,
    11: 22,
    12: 22,
    13: 23,
    14: 23,
    15: 24,
    16: 24,
    // 2nd round
    17: 25,
    18: 25,
    19: 26,
    20: 26,
    21: 27,
    22: 27,
    23: 28,
    24: 28,
    // 3rd round
    25: 29,
    26: 29,
    27: 30,
    28: 30,
    // 4th round
    29: 32,
    30: 32,
    // 5th round
    //31: 32
    // 6th round
};

/**
 * Match schema
 * {
 *      id: string,
 *      match: number,  // match number
 *      round: number,  // round number
 *      sport: string,  // pingpong|basketball|football|tennis|volleyball|netball|handball
 *      team1: string,  // team id
 *      team2: string,  // team id
 *      score1: number,
 *      score2: number,
 *      winner: string, // team1|team2
 *      status: string,  // active|closed|cancelled
 * }
 */


export const initMatches = async (event) => {
    console.log('initMatches', { event });
    if (!event)
        return { erorr: 'E_MATCHES_INIT_MISSING_EVENT' };

    var teams = await queryTeams({ event });
    var settings = await getSettings(event);

    const matches = await initializeMatches(event, teams, settings.sports);

    settings.initialized = true;
    await upsertSettings(event, settings);

    console.log('MATCHES', matches);
    // insert data into MongoDB
    const result = await db.collection('matches').insertMany(matches);
    // return JSON response
    return result;
}

export const upsertMatch = async (data) => {
    var isnew = !data.id;
    var result = null;
    //console.log('upsertMatch, isnew:', isnew, data);
    if (isnew) {
        data.id = crypto.randomUUID();
        result = await db.collection('matches').insertOne(data);
    } else {
        // insert data into MongoDB
        result = await db.collection('matches').updateOne({ id: data.id }, { $set: data }, { upsert: true });
    }

    if (data.winner) {
        console.log('upsertMatch, update next match', { result, data });
        var nextMatch = nextMatchForWinner[data.match];
        var filter = { event: data.event, sport: data.sport, match: nextMatch };
        var winner_result = await db.collection('matches').updateOne({ $and: [ filter ] }, { $set: { [data.match % 2 == 0 ? 'team2' : 'team1']: data.winner } });
        console.log('upsertMatch, update next match result', { filter, winner_result });
    }
    // the loser in round 4 plays match 31
    if (data.match === 29 || data.match === 30) {
        console.log('Match 29 nebo 30', { data });
        var result = await db.collection('matches').updateOne({ $and: [ { event: data.event, sport: data.sport, match: 31 } ] }, { $set: { [data.match % 2 == 0 ? 'team2' : 'team1']: data.team1 === data.winner ? data.team2 : data.team1 } });
        var result_match = await db.collection('matches').find({ $and: [ { event: data.event, sport: data.sport, match: 31 } ] }).toArray();
        console.log('UPDATING 3-4', result, result_match);
    }
    // return JSON response
    delete data._id;
    return result;
}

export const getMatch = async (id) => {
    const match = await db.collection('matches').findOne({ id });
    //console.log('getMatch', { id, match });
    if (!match) {
        return null;
    }
    delete match._id;
    return { match };
}

export const queryMatches = async (filter = {}) => {
    const matches = await db.collection('matches').find(filter).project({ _id: 0 }).toArray();
    //console.log('queryMatches', { filter, matches });
    if (!matches) {
        return { matches: [] };
    }
    return { matches };
}

export const deleteMatch = async (id) => {
    const result = await db.collection('matches').deleteOne({ id });
    //console.log('deleteMatch', { id, result });
    return { result };
}