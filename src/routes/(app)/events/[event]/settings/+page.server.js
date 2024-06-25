import { error } from '@sveltejs/kit';
import { getSettings } from '$db/settings.js';
import { getSports } from '$db/codelists.js';



/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const data = await getSettings(params.event);
    const disciplines = await getSports();
//console.log('event.settings.load:', { data, disciplines });
	return { settings: { sports: [], ...data }, disciplines };
}