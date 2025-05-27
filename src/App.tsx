import { useEffect, useState } from 'react';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User } from 'firebase/auth';
import { DataSnapshot } from 'firebase/database';
import { auth } from './config/firebase-config';
import AppContext, { AppContextType, UserData } from './providers/AppContext';
import { BrowserRouter } from 'react-router-dom';
import { getUserData } from './services/users.service';
 
function App() {
  const [appState, setAppState] = useState<Omit<AppContextType, 'setContext'>>({
    user: null,
    userData: null,
  });
 
  const [user, loading, error] = useAuthState(auth);
 
  useEffect(() => {
    if (!user) {
      setAppState({ user: null, userData: null });
      return;
    }
 
    setAppState((prev) => ({ ...prev, user }));
 
    getUserData(user.uid)
      .then((snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
          throw new Error('Error loading user data...');
        }
 
        const data = snapshot.val() as Record<string, UserData>;
        const firstKey = Object.keys(data)[0];
        const userData = data[firstKey];
 
        setAppState((prev) => ({
          ...prev,
          userData,
        }));
      })
      .catch((e: any) => {
        alert(e.message);
        console.error(e.message);
      });
  }, [user]);
 
  return (
<AppContext.Provider value={{ ...appState, setContext: setAppState }}>
<BrowserRouter>
        {/* TODO: Add your routes/components here */}
</BrowserRouter>
</AppContext.Provider>
  );
}
 
export default App;