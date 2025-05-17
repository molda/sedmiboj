import { getDB } from '$db/mongo';
import { SECRET_KEY } from '$env/static/private';
import crypto from 'crypto';

const db = getDB();

const ALLOWED_EMAILS = [
    'honza.sm@gmail.com',
    'cerna@alcontreal.cz',
    'vlasek@alumax.cz',
];

// Hash password with a random salt
export const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt + SECRET_KEY, 10000, 64, 'sha512')
        .toString('hex');
    return { hash, salt };
};

// Verify password against stored hash and salt
export const verifyPassword = (password, storedHash, storedSalt) => {
    const hash = crypto
        .pbkdf2Sync(password, storedSalt + SECRET_KEY, 10000, 64, 'sha512')
        .toString('hex');
    return hash === storedHash;
};

// Create a function to authenticate a user
export const authenticateUser = async (_email, password) => {
    console.log('authenticateUser', { _email, password });
    let user = await db.collection('users').findOne({ email: _email });

    if (!user) {
        
        if (!ALLOWED_EMAILS.includes(_email)) {
            return null;
        }

        // If user doesn't exist, create a new one
        await upsertUser({ email: _email, password });
        user = await db.collection('users').findOne({ email: _email });
    }

    const isValid = verifyPassword(password, user.password, user.salt);

    if (!isValid) {
        return null;
    }

    // Return user without sensitive data
    delete user._id;
    delete user.password;
    delete user.salt;

    return user;
};

export const getUser = async (id) => {
    const user = await db.collection('users').findOne({ id });
    console.log('getuser', { id, user });

    if (!user) {
        return null;
    }

    delete user._id;
    delete user.password;
    delete user.salt;

    return { user };
};

export const queryUsers = async (filter = {}) => {
    const users = await db.collection('users').find(filter).project({ _id: 0 }).toArray();
    console.log('queryUsers', { filter, users });

    if (!users) {
        return [];
    }

    users.forEach((user) => {
        delete user._id;
        delete user.password;
        delete user.salt;
    });

    return users;
}

export const deleteUser = async (id) => {
    const result = await db.collection('users').deleteOne({ id });
    console.log('deleteUser', { id, result });

    return { result };
};

export const upsertUser = async (userData) => {
    const user = { ...userData };

    // If password is provided, hash it
    if (user.password) {
        const { hash, salt } = hashPassword(user.password);
        user.password = hash;
        user.salt = salt;
    }

    const result = await db.collection('users').updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
    );

    console.log('upsertUser', { userId: user.id, result });

    return { result };
};