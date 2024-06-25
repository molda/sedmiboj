import { getDB } from '$db/mongo';
const db = getDB();

export const getEvent = async (id) => {
    const event = await db.collection('events').findOne({ id });
    if (!event) {
        return null;
    }
    delete event._id;
    //console.log({ event });
    return { event };
}

export const getEvents = async () => {
    const events = await db.collection('events').find().project({ _id: 0 }).toArray();
    return { events };
}

export const createEvent = async (event) => {
    await db.collection('events').insertOne(event);
    return { event };
}

export const updateEvent = async (id, event) => {
    await db.collection('events').updateOne({ id }, { $set: event });
    return { event };
}