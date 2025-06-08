import {
    get,
    set,
    ref,
    query,
    equalTo,
    orderByChild,
    update,
} from 'firebase/database';
import { db } from '../config/firebase-config';
import type { UserData } from '../providers/UserContext';

export const getUserByHandle = async (handle: string): Promise<UserData> => {
    const snapshot = await get(ref(db, `users/${handle}`));
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        throw new Error(`User not found for query: ${handle}`);
    }

};

export const getUserByEmail = async (email: string) => {
    try {
        const usersRef = ref(db, 'users');
        const userQuery = query(
            usersRef,
            orderByChild('email'),
            equalTo(email)
        );
        return get(userQuery);
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
};

export const createUserHandle = (
    handle: string,
    uid: string,
    email: string
) => {
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
    email: string | null
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
        const snapshot = await get(
            query(ref(db, 'users'), orderByChild('uid'), equalTo(uid))
        );
        return snapshot;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
};

export const getProfileImageUrl = async (
    handle: string
): Promise<string | null> => {
    try {
        const snapshot = await get(ref(db, `users/${handle}/profileImg`));
        if (snapshot.exists()) {
            return snapshot.val() as string;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getProfileImageUrl:', error);
        // throw error;
        return null;
    }
};

export const toggleUserToContacts = async (loggedInUser: UserData, handle: string): Promise<boolean | undefined> => {
    let hasContact: boolean | undefined;
    try {
        const userObject = await getUserByHandle(loggedInUser.handle);
        hasContact = userObject.contacts && Object.keys(userObject.contacts).includes(handle);

        if (hasContact) {
            await update(ref(db), {[`/users/${loggedInUser.handle}/contacts/${handle}`]: null});
            return false;
        } else {
            await update(ref(db), {[`/users/${loggedInUser.handle}/contacts/${handle}`]: true});
            return true;
        }
    }
    catch (error) {
        console.error('Failed setting friend status: ', error);
        return hasContact;
    }
}