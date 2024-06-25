import { error } from '@sveltejs/kit';
import { deleteTeam } from '$db/teams';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
    var event = params.event;
    var id = params.id;
	var result = await deleteTeam(id);

//console.log('DELETE:', event, result);

	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}