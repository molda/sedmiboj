import { error } from '@sveltejs/kit';
import { queryTeams } from '$db/teams';
import { upsertRecord, updateRecord } from '$db/collections.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const teams = await queryTeams({ event: params.event });

	if (teams) {
		return { teams };
	}

	error(404, 'Not found');
}