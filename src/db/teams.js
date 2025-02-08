import { getDB } from '$db/mongo';
import { upsertRecord } from './collections';

const db = getDB();

//const result = await db.collection('teams').updateOne({ id: 'undefined' }, { $set: { id: 'b692b2be-e0e5-6666-8be6-434bee6938ab' }}, { upsert: true });
//console.log(result);
export const getTeam = async (id) => {
    const team = await db.collection('teams').findOne({ id });
    //console.log('getTeam', { id, team });
    if (!team) {
        return null;
    }
    delete team._id;
    return { team };
}

export const queryTeams = async (filter = {}) => {
    const teams = await db.collection('teams').find(filter).project({ _id: 0 }).toArray();
    //console.log('queryTeams', { filter, teams });
    if (!teams) {
        return [];
    }
    return teams;
}

export const deleteTeam = async (id) => {
    const result = await db.collection('teams').deleteOne({ id });
    //console.log('deleteTeam', { id, result });
    return { result };
}

// (async () => {
//     console.log('Creating teams');
//     for (let i = 0; i < 32; i++) {
//         await upsertRecord('teams', {
//             id: 'team' + (i + 1),
//             name: 'Team ' + (i + 1),
//             player1: 'Player 1 (' + (i + 1) + ')',
//             player2: 'Player 2 (' + (i + 1) + ')',
//             paid: true,
//             event: '53f5acb0-be0e-492d-944f-43de31ed01b8'
//         });
//     }
// })();