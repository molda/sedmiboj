import { getDB } from '$db/mongo';
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