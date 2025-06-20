import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { DataSnapshot } from 'firebase/database';
import { auth } from './config/firebase-config';
import AppContext from './providers/UserContext';
import type { UserContextType, UserData } from './providers/UserContext';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getUserData } from './services/users.service';
import HomePage from './pages/HomePage/HomePage';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import { AlertTypes } from './constants/alert.constants';
import AlertContext from './providers/AlertContext';
import Alert from './components/Alert/Alert';
import Loader from './components/Loader/Loader';
import AuthModal from './components/AuthModal/AuthModal';
import { AnimatePresence } from 'framer-motion';
import CreateEventModal from './components/EventModal/CreateEventModal';
import { useTheme } from './utils/useTheme';
import { CalendarTypes } from './constants/calendar.constants';
import Header from './components/Header/Header';
import AnimatedPage from './components/AnimatedPage';
import ProfileModal from './components/ProfileModal/ProfileModal';
import type { DropdownTypes } from './constants/dropdown.constants';
import DropdownContext from './providers/DropdownContext';
import NewContactListModal from './components/NewContactListModal/NewContactListModal';
import EventDetailsRouteModal from './components/EventDetailsModal/EventDetailsRouteModal';
import EditEventModal from './components/EditEventModal/EditEventModal';
import AdminPanel from './components/AdminPanel/AdminPanel';
import { logoutUser } from './services/auth.service';

function App() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [userData, setUserData] = useState<UserData | null>(null);

    const [firebaseUser, loading, error] = useAuthState(auth);

    const [calendarType, setCalendarType] = useState<CalendarTypes>(() => {
        const stored = localStorage.getItem('calendarType');
        return stored === null ? CalendarTypes.MONTH : JSON.parse(stored);
    });

    const [alertType, setAlertType] = useState<AlertTypes | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [dropdownKey, setDropdownKey] = useState<DropdownTypes | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

    const { prefersDark } = useTheme();

    const openDropdown = (key: DropdownTypes, mouseEvent: React.MouseEvent) => {
        setDropdownPosition({ top: mouseEvent.clientY, left: mouseEvent.clientX })
        setDropdownKey(key);
    };

    const closeDropdown = () => {
        setDropdownKey(null);
        setDropdownPosition(null);
    };

    const DialogContextValue = {
        dropdownKey,
        dropdownPosition,
        openDropdown,
        closeDropdown,
    };

    const showAlert = (alertTypeParam: AlertTypes, alertMessageParam: string | null) => {
        setAlertMessage(alertMessageParam);
        setAlertType(alertTypeParam);

        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }

        alertTimeoutRef.current = setTimeout(() => {
            setAlertType(null);
            setAlertMessage(null);
            alertTimeoutRef.current = null;
        }, 5000);
    };

    const AlertContextValue = {
        alertMessage,
        alertType,
        showAlert,
    };

    const UserContextValue: UserContextType = {
        user,
        setUser,
        userData,
        setUserData,
    };

    useEffect(() => {
        if (firebaseUser === undefined) {
            return;
        }
        if (firebaseUser === null) {
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
    }, [firebaseUser]);

    useEffect(() => {
        localStorage.setItem('calendarType', JSON.stringify(calendarType));
    }, [calendarType])

    useEffect(() => {
        const root = document.documentElement;
        const resolvedTheme = prefersDark === false
            ? 'bumblebee'
            : prefersDark === true
                ? 'halloween'
                : window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'halloween'
                    : 'bumblebee';
        root.setAttribute('data-theme', resolvedTheme);
    }, [prefersDark]);

    useEffect(() => {
        if (error) {
            showAlert(AlertTypes.ERROR, error.message);
        }
    }, [error]);

    if (loading || user === undefined) return (
        <AnimatePresence mode='wait'>
            <Loader key='loader' />
        </AnimatePresence>
    );

    if (userData?.isBlocked) {
        return (
            <div className='fixed w-full h-full flex justify-center items-center'>
                <div className='flex flex-col gap-4 p-8 bg-error/70 rounded-box'>
                    <p className='text-3xl text-error-content'>You are blocked. Your access to TimeNest has been suspended until further notice.</p>
                    <p className='text-xl text-error-content/80'>If you believe this was a mistake, please contact one of the admins and provide details on your situation.</p>
                    <button onClick={logoutUser} className='btn btn-neutral btn-xl self-end'>Logout</button>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={UserContextValue}>
            <AlertContext.Provider value={AlertContextValue}>
                <DropdownContext.Provider value={DialogContextValue}>
                    {alertType && <Alert key={alertType + alertMessage} />}
                    <BrowserRouter>
                        <div
                            id="main-app"
                            className="flex flex-col w-full justify-center h-[100vh] pt-24 bg-base-200 overflow-hidden"
                        >
                            {firebaseUser && <Header calendarType={calendarType} setCalendarType={setCalendarType} />}
                            <AnimatePresence mode='wait'>
                                <Routes>
                                    {firebaseUser === null ? (
                                        <>
                                            <Route path="/welcome" element={<HomePage />}>
                                                <Route path='/welcome/auth' element={<AuthModal />} />
                                                <Route path='/welcome/event/:eventId' element={<EventDetailsRouteModal />} />
                                            </Route>
                                            <Route path="*" element={<Navigate to="/welcome" replace />} />
                                        </>
                                    ) : (
                                        <>
                                            <Route path="/app" element={
                                                <AnimatedPage>
                                                    <CalendarPage calendarType={calendarType} setCalendarType={setCalendarType} />
                                                </AnimatedPage>
                                            }>
                                                <Route path='/app/event/create' element={<CreateEventModal />} />
                                                <Route path='/app/account/:userHandle' element={<ProfileModal />} />
                                                <Route path='/app/account/create-list' element={<NewContactListModal />} />
                                                <Route path='/app/event/:eventId' element={<EventDetailsRouteModal />} />
                                                <Route path="/app/event/edit/:eventId" element={<EditEventModal />} />
                                                {userData?.isAdmin && <Route path="/app/admin" element={<AdminPanel />} />}
                                            </Route>
                                            <Route path="*" element={<Navigate to="/app" replace />} />
                                        </>
                                    )}
                                </Routes>
                            </AnimatePresence>
                        </div>
                    </BrowserRouter>
                </DropdownContext.Provider>
            </AlertContext.Provider>
        </AppContext.Provider>
    );
}

export default App;
