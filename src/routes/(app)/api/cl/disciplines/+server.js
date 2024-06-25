import { getDisciplines } from '$db/codelists.js';
    
/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    var disciplines = await getDisciplines();
    return new Response(JSON.stringify({ disciplines }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}