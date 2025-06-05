import { createContext, useContext } from 'react';

export const NewUserContext = createContext<{ isNew: boolean }>({ isNew: true });

export const useNewUserContext = () => useContext(NewUserContext);