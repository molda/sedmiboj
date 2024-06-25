import { getCollection } from '$db/collections';

// create api endpoint for GET to fetch events using mongo
export async function GET(request) {
    // get skip and limit from searchParams in request
    //const url = new URL(request.url);
    let skip = Number(request.url.searchParams.get('skip'));
	if(skip < 0)
        skip = 0;

    // get repositories from MongoDB
    const events = await getCollection('events', skip * 20, 20);
    return new Response(JSON.stringify({ events }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}