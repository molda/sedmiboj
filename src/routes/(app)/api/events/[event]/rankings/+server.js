import { error } from '@sveltejs/kit';
import { queryRankings } from '$db/rankings';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, request, url }) {
    //const data = await request.json();
    var event = params.event;
    console.log('GET /api/events/[event]/rankings', { event }, url.searchParams.get('orderby'));
    var result = await queryRankings({ event }, { orderby: url.searchParams.get('orderby')});
	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}