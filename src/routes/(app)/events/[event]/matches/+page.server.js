import { error } from '@sveltejs/kit';
import { queryMatches } from '$db/matches.js';
import { getSettings } from '$db/settings.js';
import { queryTeams } from '$db/teams.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { matches } = await queryMatches({ event: params.event });
    const settings = await getSettings(params.event);
	const teams = await queryTeams({ event: params.event });

	if (matches) {
		return { matches, settings, teams };
	}

	error(404, 'Not found');
}