import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { connect } from '$db/mongo';
import { AUTH_SECRET } from '$env/static/private';
import { authenticateUser } from './db/users';
import { sequence } from '@sveltejs/kit/hooks';

// Connect to MongoDB before starting the server
connect().then(() => {
    console.log("MongoDB started");
}).catch((e) => {
    console.log("MongoDB failed to start");
    console.log(e);
});

const authenticationHandle = SvelteKitAuth({
    useSecureCookies: true,
    trustHost: true,
    secret: AUTH_SECRET,
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {}
            },
            authorize: async (credentials) => {

                var { email, password } = credentials;

                // Check if the user exists in the database
                const user = await authenticateUser(email, password);

                if (!user) {
                    throw new Error('User not found.');
                } else {
                    return user;
                }
            }
        })
    ],
});

async function authorizationHandle({ event, resolve }) {
    // Protect any routes under /api with method POST, PUT, DELETE
    if (event.url.pathname.startsWith('/api') && (event.request.method !== 'OPTIONS' && event.request.method !== 'GET' && event.request.method !== 'HEAD')) {
        const session = await event.locals.auth();

        console.log('[hooks.server.js] authorizationHandle', event);

        if (!session) {
            // If the user is not authenticated, return a 401 Unauthorized response
            return new Response('Unauthorized', {
                status: 401
            });
        }
    }

    // If the request is still here, just proceed as normally
    return resolve(event);
}

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(authenticationHandle, authorizationHandle)