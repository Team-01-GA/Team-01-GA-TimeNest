import {
    get,
    set,
    ref,
    query,
    equalTo,
    orderByChild,
    update,
} from 'firebase/database';
import { db, storage } from '../config/firebase-config';
import type { UserData } from '../providers/UserContext';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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

export const getUserByPhone = async (number: string) => {
    try {
        const usersRef = ref(db, 'users');
        const userQuery = query(
            usersRef,
            orderByChild('phoneNumber'),
            equalTo(number)
        );
        return get(userQuery);
    } catch (error) {
        console.error('Error in getUserByPhone:', error);
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
    email: string | null,
    phoneNumber: string,
) => {
    try {
        if (handle === '_init') {
            throw new Error('Handle init error.');
        }
        return set(ref(db, `users/${handle}`), {
            uid,
            handle,
            firstName,
            lastName,
            email,
            phoneNumber,
            isAdmin: false,
            isBlocked: false,
            prefersFullName: false,
            newEventsPublic: false,
            openInvites: true,
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

export const updateUserProfileFields = async (
    handle: string,
    fields: Partial<Pick<UserData, "bio" | "firstName" | "lastName" | "phoneNumber" | "newEventsPublic" | "openInvites">>
): Promise<void> => {
    try {
        await update(ref(db, `users/${handle}`), fields);
    } catch (error) {
        console.error("Error updating user profile fields:", error);
    }
};

export const uploadProfileImage = async (userData: UserData, file: File): Promise<string | null> => {
    try {
        const fileRef = storageRef(storage, `${userData.uid}/profileImg`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await update(ref(db), {
            [`/users/${userData.handle}/profileImg`]: url
        });

        return url;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return null;
    }
};

export const removeProfileImage = async (userData: UserData): Promise<boolean> => {
    try {
        const fileRef = storageRef(storage, `${userData.uid}/profileImg`);
        await deleteObject(fileRef);

        await update(ref(db), {
            [`/users/${userData.handle}/profileImg`]: null
        });

        return true;
    } catch (error) {
        console.error("Error removing profile image:", error);
        return false;
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
        console.error('Error in getting profile image:', error);
        // throw error;
        return null;
    }
};

export const addUserToContactList = async (loggedInUser: UserData, handle: string, contactList: string): Promise<void> => {
    try {
        await update(ref(db), {[`/users/${loggedInUser.handle}/contacts/${contactList}/${handle}`]: true});
    }
    catch (error) {
        console.error(`Failed adding user "${handle}" to contact list "${contactList}": `, error);
    }
};

export const removeUserFromContactList = async (loggedInUser: UserData, handle: string, contactList: string): Promise<void> => {
    try {
        await update(ref(db), {[`/users/${loggedInUser.handle}/contacts/${contactList}/${handle}`]: null});
    }
    catch (error) {
        console.error(`Failed removing user "${handle}" from contact list "${contactList}": `, error);
    }
};

export const removeUserFromAllContactLists = async (loggedInUser: UserData, handle: string): Promise<void> => {
    try {
        const userObject = await getUserByHandle(loggedInUser.handle);
        if (userObject.contacts) {
            const updateObj: Record<string, null> = {};

            for (const [listName, contactsObj] of Object.entries(userObject.contacts)) {
                if (contactsObj && contactsObj[handle] !== undefined) {
                    updateObj[`/users/${loggedInUser.handle}/contacts/${listName}/${handle}`] = null;
                }
            }

            if (Object.keys(updateObj).length > 0) {
                await update(ref(db), updateObj);
            }
        } else {
            throw new Error(`Cannot remove contact as current user ${loggedInUser.handle} doesn't have any contact lists.`);
        }
    } catch (error) {
        console.error(`Failed removing user "${handle}" from all contact lists: `, error);
    }
};

export const getContactsAsContactListMaps = async (loggedInUser: UserData): Promise<{ listName: string; handlesMap: Record<string, boolean | null> }[]> => {
    try {
        const userObject = await getUserByHandle(loggedInUser.handle);

        if (!userObject.contacts) {
            return [];
        }

        return Object.entries(userObject.contacts).map(([listName, list]) => ({
            listName,
            handlesMap: list
                ? Object.fromEntries(
                    Object.entries(list).filter(([handle]) => handle !== '_init')
                  )
                : {},
        }));
    } catch (error) {
        console.error(`Failed to get contact lists for user "${loggedInUser.handle}":`, error);
        return [];
    }
};

export const getAllContacts = async (handle: string): Promise<Set<string | never>> => {
    try {
        const userObject = await getUserByHandle(handle);
        let handles: string[] = [];

        if (userObject.contacts) {
            handles = Object.entries(userObject.contacts as Record<string, Record<string, true>>)
                .flatMap(([, list]) =>
                    Object.entries(list)
                        .filter(([contactHandle]) => contactHandle !== '_init')
                        .map(([contactHandle]) => contactHandle)
                );
        } else {
            return new Set();
        }

        return new Set(handles);
    } catch (error) {
        console.error(`Failed getting all contacts for user "${handle}":`, error);
        return new Set();
    }
};

export const checkUserInContacts = async (loggedInUser: UserData, handle: string): Promise<boolean> => {
    try {
        const contacts = (await getAllContacts(loggedInUser.handle));

        if (contacts.size && contacts.has(handle)) {
            return true; 
        }

        return false;
    } catch (error) {
        console.error(`Failed getting contact status for user "${handle}": `, error);
        return false;
    }
};

export const addNewContactList = async (loggedInUser: UserData, listName: string) => {
    try {
        const userObject = await getUserByHandle(loggedInUser.handle);
        const normalizedListName = listName.trim();
        if (!userObject.contacts || !userObject.contacts[normalizedListName]) {
            await update(ref(db), {
                [`/users/${loggedInUser.handle}/contacts/${normalizedListName}/_init`]: true
            });
            return true;
        } else {
            return false;
        }
    }
    catch (error) {
        console.error(`Failed adding new contact list for current user "${loggedInUser.handle}": `, error);
        return null;
    }
}

export const removeContactList = async (loggedInUser: UserData, listName: string) => {
    try {
        const userObject = await getUserByHandle(loggedInUser.handle);
        if (userObject.contacts && userObject.contacts[listName]) {
            await update(ref(db), {
                [`/users/${loggedInUser.handle}/contacts/${listName}`]: null
            });
            return true;
        } else {
            return false;
        }
    }
    catch (error) {
        console.error(`Failed removing contact "${listName}" list for current user "${loggedInUser.handle}": `, error);
        return null;
    }
}