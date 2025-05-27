import { createContext } from 'react';
import { User } from 'firebase/auth';
 
export interface UserData {
  name?: string;
  email?: string;
  [key: string]: any;
}
 
export interface AppContextType {
  user: User | null;
  userData: UserData | null;
  setContext: React.Dispatch<React.SetStateAction<AppContextType>>;
}
 
// Default context value
const AppContext = createContext<AppContextType>({
  user: null,
  userData: null,
  setContext: () => {}, // default no-op
});
 
export default AppContext;