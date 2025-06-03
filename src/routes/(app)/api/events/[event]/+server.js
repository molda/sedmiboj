import { error } from '@sveltejs/kit';
import { getEvent } from '$db/events';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    var event = params.event;
    var result = await getEvent(event);
	return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// /** @type {import('./$types').RequestHandler} */
// export async function POST({ params, request }) {
//     var event = params.event;
//     var body = await request.json();
//     var result = await getEvent(event, body);
//     if (result) {
//         return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
//     } else {
//         throw error(404, 'Event not found');
//     }
// }

// /** @type {import('./$types').RequestHandler} */
// export async function DELETE({ params }) {
//     var event = params.event;
//     var result = await getEvent(event);
//     if (result) {
//         return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
//     } else {
//         throw error(404, 'Event not found');
//     }
// }

// /** @type {import('./$types').RequestHandler} */
// export async function PUT({ params, request }) {
//     var event = params.event;
//     var body = await request.json();
//     var result = await getEvent(event, body);
//     if (result) {
//         return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
//     } else {
//         throw error(404, 'Event not found');
//     }
// }