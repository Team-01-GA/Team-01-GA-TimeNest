import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface UserData {
  name?: string;
  email?: string;
  handle: string;
  [key: string]: unknown;
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

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},

  userData: null,
  setUserData: () => {},
});

export default AppContext;