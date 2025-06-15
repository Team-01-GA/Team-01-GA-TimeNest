import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface UserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    handle: string;
    phoneNumber: string;
    profileImg?: string;
    contacts?: { [key: string]: {[key: string]: true | null} | null };
    sharesContacts?: boolean;
    bio?: string;
    createdOn: string;
    [key: string]: unknown;
    isAdmin?: boolean;
}
// export interface UserData {
//   uid: string;
//   email: string;
//   handle: string;
//   firstName?: string;
//   lastName?: string;
//   isAdmin?: boolean;
//   isBlocked?: boolean;
//   createdOn?: string;
//   prefersFullName?: boolean;
// }

export interface UserContextType {
    user: User | null | undefined;
    setUser: (user: User | null) => void;

    userData: UserData | null;
    setUserData: (data: UserData | null) => void;
}

const UserContext = createContext<UserContextType>({
    user: undefined,
    setUser: () => {},

    userData: null,
    setUserData: () => {},
});

export default UserContext;
