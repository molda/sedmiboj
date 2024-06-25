import { getDB } from '$db/mongo';
const db = getDB();

export async function getCollection(collection_name, skip = 0, limit = 20) {
    // get repositories from MongoDB with skip and limit
    const data = await db.collection(collection_name).find({}).project({ _id: 0 }).skip(skip).limit(limit).toArray();

    // return JSON response
    return data;
}

export async function searchCollection(collection_name, search) {
    // get repositories from MongoDB with search query and regex options
    const data = await db.collection(collection_name).find({ title: { $regex: search, $options: 'i' }}).project({ _id: 0 }).toArray();

    // return JSON response
    return data;
}

export async function upsertRecord(collection_name, data) {
    var isnew = !data.id;
    var result = null;
    console.log('upsertRecord, isnew:', isnew, data);
    if (isnew) {
        data.id = crypto.randomUUID();
        result = await db.collection(collection_name).insertOne(data);
    } else {
        // insert data into MongoDB
        result = await db.collection(collection_name).updateOne({ id: data.id }, { $set: data }, { upsert: true });
    }
    // return JSON response
    delete data._id;
    return result;
}