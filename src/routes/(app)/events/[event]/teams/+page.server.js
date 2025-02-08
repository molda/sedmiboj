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

export const actions = {
	create: async ({ request }) => {
		var team = Object.fromEntries(await request.formData());
		if (team.empty)
			team.name = '<neobsazeno>';

        const result = await upsertRecord('teams', team);
        delete team._id;
        //console.log('Team created:', team, result);
        return { success: true, team };
	},
	update: async ({ request }) => {
		var team = Object.fromEntries(await request.formData());
        const result = await upsertRecord('teams', team);
        delete team._id;
        //console.log('Team updated:', team, result);
        return { success: true, team };
	}
};