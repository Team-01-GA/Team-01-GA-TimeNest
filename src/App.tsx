import { useEffect, useState } from 'react';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { DataSnapshot } from 'firebase/database';
import { auth } from './config/firebase-config';
import AppContext from './providers/AppContext';
import type { AppContextType, UserData } from './providers/AppContext';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getUserData } from './services/users.service';
import HomePage from './pages/HomePage/HomePage';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import ModalContext from './providers/ModalContext';
import { AlertTypes } from './constants/alert.constants';
import delay from './constants/delay';
import AlertContext from './providers/AlertContext';
import Alert from './components/Alert/Alert';
import Loader from './components/Loader/Loader';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(false);

    const [modalKey, setModalKey] = useState<string | null>(null);

    const openModal = (key: string) => setModalKey(key);
    const closeModal = () => setModalKey(null);

    const modalContextValue = {
        modalKey,
        openModal,
        closeModal,
    };

    const [alertType, setAlertType] = useState<AlertTypes | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    const showAlert = async (alertTypeParam: AlertTypes, alertMessageParam: string | null) => {
        setAlertMessage(alertMessageParam);
        setAlertType(alertTypeParam);
        await delay(5000);
        setAlertType(null);
        setAlertMessage(null);
    };

    const AlertContextValue = {
        alertMessage,
        alertType,
        showAlert,
    };

    const [firebaseUser, loading, error] = useAuthState(auth);

    useEffect(() => {
        setUserLoading(true);
        if (!firebaseUser) {
            setUser(null);
            setUserData(null);
            setUserLoading(false);
            return;
        }

        setUser(firebaseUser);

        // getUserData(firebaseUser.uid)
        //     .then((snapshot: DataSnapshot) => {
        //         if (!snapshot.exists()) {
        //             throw new Error('User data not found');
        //         }
        //         const data = snapshot.val();
        //         setUserData(data);
        //     })
        getUserData(firebaseUser.uid)
            .then((snapshot: DataSnapshot) => {
                if (!snapshot.exists()) {
                    throw new Error('User data not found');
                }
                const usersObj = snapshot.val();
                // Extract first user from the query result
                const firstUser = Object.values(usersObj)[0] as UserData;
                
                // Ensure handle is present
                if (!firstUser.handle) {
                    throw new Error('User profile incomplete - missing handle');
                }
                
                setUserData(firstUser as UserData);
            })
            .catch((err) => {
                console.error(err.message);
            })
            .finally(() => {
                setUserLoading(false);
            });

    }, [firebaseUser]);

    const contextValue: AppContextType = {
        user,
        setUser,
        userData,
        setUserData,
    };

    if (loading || userLoading) return <Loader />;

    if (error) {
        showAlert(AlertTypes.ERROR, error.message);
        return <Alert />;
    }

    return (
        <AppContext.Provider value={contextValue}>
            <AlertContext.Provider value={AlertContextValue}>
                <Alert />
                <ModalContext.Provider value={modalContextValue}>
                    <BrowserRouter>
                        <div
                            id="main-app"
                            className="flex flex-col w-full h-[100vh] pt-14 bg-base-200"
                        >
                            <Routes>
                                {!user ? (
                                    <>
                                        <Route path="/welcome" element={<HomePage />} />
                                        <Route path="*" element={<Navigate to="/welcome" replace />} />
                                    </>
                                ) : (
                                    <>
                                        <Route path="/app" element={<CalendarPage />} />
                                        <Route path="*" element={<Navigate to="/app" replace />} />
                                    </>
                                )}
                            </Routes>
                        </div>
                    </BrowserRouter>
                </ModalContext.Provider>
            </AlertContext.Provider>
        </AppContext.Provider>
    );
}

export default App;
