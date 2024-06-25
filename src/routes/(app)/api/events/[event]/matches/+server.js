import { error } from '@sveltejs/kit';
import { queryMatches } from '$db/matches';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    var event = params.event;
    var result = await queryMatches({ event });
	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}