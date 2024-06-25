import { getCollection, upsertRecord } from '$db/collections';   

export async function load(request) {   
    //console.log('request', request);
    // get skip and limit from searchParams in request
    //const url = new URL(request.url);
    let skip = Number(request.url.searchParams.get('skip')); 
	if(skip < 0) 
        skip = 0;

    // get repositories from MongoDB
    const events = await getCollection('events', skip * 20, 20);
	return { events };
}

export const actions = {
	create: async ({ request }) => {
		var event = await request.formData();
        event = [...event].reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        const result = await upsertRecord('events', event);
        //console.log('Event:', event, result);
        return { success: true, event };
	}
};