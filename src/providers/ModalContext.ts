import { createContext } from 'react';

export type ModalContextType = {
    modalKey: string | null;
    openModal: (key: string) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType>({
    modalKey: null,
    openModal: () => {},
    closeModal: () => {},
});

export default ModalContext;