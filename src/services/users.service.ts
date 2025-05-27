import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getUserByHandle = (handle: string) => {
    return get(ref(db, `users/${handle}`));
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

export const getUserData = (uid: string) => {
    return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};
