import { createContext } from 'react';
import type { AlertTypes } from '../constants/alert.constants';

export type AlertContextType = {
    alertType: AlertTypes | null;
    alertMessage: string | null;
    showAlert: (alertTypeParam: AlertTypes, alertMessageParam: string | null) => Promise<void>;
};

const AlertContext = createContext<AlertContextType>({
    alertType: null,
    alertMessage: null,
    showAlert: async () => {},
});

export default AlertContext;