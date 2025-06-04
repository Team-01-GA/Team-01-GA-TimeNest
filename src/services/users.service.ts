import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getUserByHandle = (handle: string) => {
    return get(ref(db, `users/${handle}`));
};

export const getUserByEmail = async (email: string) => {
    try {
        const usersRef = ref(db, 'users');
        const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
        return get(userQuery);
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
};

export const createUserHandle = (handle: string, uid: string, email: string) => {
    return set(ref(db, `users/${handle}`), {
        handle,
        uid,
        email,
        createdOn: new Date(),
        likedTweets: {},
    });
};

export const createUserObject = async (
    firstName: string,
    lastName: string,
    handle: string,
    uid: string,
    email: string | null,
) => {
    try {
        return set(ref(db, `users/${handle}`), {
            uid,
            handle,
            firstName,
            lastName,
            email,
            isAdmin: false,
            isBlocked: false,
            prefersFullName: false,
            createdOn: `${Date.now()}`,
        });
    } catch (error) {
        console.error('Error in createUserObject:', error);
        throw error;
    }
};


export const getUserData = async (uid: string) => {
    try {
        const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
        return snapshot;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
};
