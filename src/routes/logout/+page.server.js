import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {  
    // Clear the user session or authentication token
    locals.user = null;

    // Redirect to the home page
    throw redirect(303, '/');
};