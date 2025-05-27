import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: 'AIzaSyA0lPgwADFIECTn-EKDdNpyUkyUIbcSJ3g',
    authDomain: 'team-01-ga-timenest.firebaseapp.com',
    projectId: 'team-01-ga-timenest',
    storageBucket: 'team-01-ga-timenest.firebasestorage.app',
    messagingSenderId: '424665628247',
    appId: '1:424665628247:web:c11b352fa2ee2af6c1ad12',
    databaseURL: 'https://team-01-ga-timenest-default-rtdb.europe-west1.firebasedatabase.app/',
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getDatabase(app);
