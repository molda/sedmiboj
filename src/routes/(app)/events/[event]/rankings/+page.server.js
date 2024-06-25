import { error } from '@sveltejs/kit';
import { queryRankings } from '$db/rankings.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const teams = await queryRankings({ event: params.event });

	if (teams) {
		return teams;
	}

	error(404, 'Not found');
}