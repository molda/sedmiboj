import { error } from '@sveltejs/kit';
import { queryTeams } from '$db/teams';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    var event = params.event;
	var teams = await queryTeams({ event });

//console.log('Request:', event, teams);

	return new Response(JSON.stringify(teams), { status: 200, headers: { 'Content-Type': 'application/json' } });
}