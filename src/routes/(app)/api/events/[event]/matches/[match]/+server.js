import { error } from '@sveltejs/kit';
import { upsertMatch } from '$db/matches';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
    const data = await request.json();
    var event = params.event;
    var match = params.match;
    console.log('POST /api/events/[event]/matches/[match]', { event, match, data });
    var result = await upsertMatch({ id: match, event, ...data }); // data = { winner, sport, match }
    delete result._id;
	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}