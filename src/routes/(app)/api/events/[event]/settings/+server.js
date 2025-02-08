import { error } from '@sveltejs/kit';
import { upsertSettings } from '$db/settings';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
    const data = await request.json();
	var result = await upsertSettings(params.event, data.settings);

console.log('Request:', params, data);

	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}