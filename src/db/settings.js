import { getDB } from '$db/mongo';
const db = getDB();

export const getDisciplines = async () => {
    return [
        { id: 'tenis', name: 'Tenis', icon: '' },
        { id: 'pingpong', name: 'Pingpong', icon: '' },
        { id: 'basketbal', name: 'Basketbal', icon: '' },
        { id: 'volejbal', name: 'Volejbal', icon: '' },
        { id: 'fotbal', name: 'Fotbal', icon: '' },
        { id: 'hazena', name: 'Házená', icon: '' },
        { id: 'nohejbal', name: 'Nohejbal', icon: '' },
    ];
}

export const getSettings = async (event) => {
    if (!event) {
        console.log('getSettings failed: missing event filter');
        return null;
    }

    const settings = await db.collection('settings').findOne({ event });
    if (!settings) {
        return { sports: [] };
    }
    
    delete settings._id;
    delete settings.settings;
    //console.log('db.settings.getSettings', settings);
    return {  sports: [], ...settings };
}

export const upsertSettings = async (settings) => {
    if (!settings?.event) {
        console.log('upsertSettings failed: missing event');
        return null;
    }

    const result = await db.collection('settings').updateOne({ event: settings.event }, { $set: settings }, { upsert: true });
    //console.log('upsertSettings', { settings, result });
    return { result };
}