import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface UserData {
  name?: string;
  email?: string;
  [key: string]: unknown; // ✅ avoid `any`
}

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