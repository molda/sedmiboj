import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { connect } from '$db/mongo';
import { AUTH_SECRET } from '$env/static/private';

// Connect to MongoDB before starting the server
connect().then(() => {
    console.log("MongoDB started");
}).catch((e) => {
    console.log("MongoDB failed to start");
    console.log(e);
});

export const handle = SvelteKitAuth({
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

                if (email === 'admin' && password === 'lhota123')
                    return {
                        email: 'admin',
                        //password: 'lhota123'
                    };
                else
                    throw new Error('User not found.');

                // logic to salt and hash password
                
            }
        })
    ],
});