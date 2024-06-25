import { error } from '@sveltejs/kit';
import { getEvent } from '$db/events';
import { queryTeams } from '$db/teams';
import { getSettings } from '$db/settings';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const event = await getEvent(params.event);
	const settings = await getSettings(params.event);
	const teams = await queryTeams({ event });

	if (event)
		return { ...event, settings, teams };

	error(404, 'Not found');
}