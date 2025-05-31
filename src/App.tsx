import { useEffect, useState } from 'react';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { DataSnapshot } from 'firebase/database';
import { auth } from './config/firebase-config';
import AppContext from './providers/AppContext';
import type { AppContextType, UserData } from './providers/AppContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getUserData } from './services/users.service';
import HomePage from './pages/HomePage/HomePage';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);

    const [firebaseUser, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (!firebaseUser) {
            setUser(null);
            setUserData(null);
            return;
        }

        setUser(firebaseUser);

        getUserData(firebaseUser.uid)
            .then((snapshot: DataSnapshot) => {
                if (!snapshot.exists()) {
                    throw new Error('User data not found');
                }
                const data = snapshot.val();
                setUserData(data);
            })
            .catch((err) => {
                console.error(err.message);
            });
    }, [firebaseUser]);

    const contextValue: AppContextType = {
        user,
        setUser,
        userData,
        setUserData,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <BrowserRouter>
                <div
                    id="main-app"
                    className="flex flex-col w-full h-[calc(100vh-3.5rem)] mt-14"
                >
                    <Routes>
                        {!user && <Route path="/" element={<HomePage />} />}
                    </Routes>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
