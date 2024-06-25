import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { connect } from '$db/mongo';

// Connect to MongoDB before starting the server
connect().then(() => {
    console.log("MongoDB started");
}).catch((e) => {
    console.log("MongoDB failed to start");
    console.log(e);
});

export const handle = SvelteKitAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {}
            },
            authorize: async (credentials) => {

                let user = {
                    email: 'test',
                    password: 'test'
                };

                // logic to salt and hash password
                
//console.log('credentials', user, credentials);
                // if (!user) {
                //     throw new Error('User not found.')
                // }

                // return json object with the user data
                return user;
            }
        })
    ],
});