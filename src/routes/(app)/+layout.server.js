import { getSettings } from '$db/settings.js';
import { getSports } from '$db/codelists.js';

export const load = async (event) => {
    const settings = await getSettings(event.params.event);
    const sports = await getSports();

    return {
        settings,
        sports
    };
};