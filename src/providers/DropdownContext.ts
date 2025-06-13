import React, { createContext } from 'react';
import type { DropdownTypes } from '../constants/dropdown.constants';

export type DropdownContextType = {
    dropdownKey: DropdownTypes | null;
    dropdownPosition: { top: number; left: number } | null;
    openDropdown: (key: DropdownTypes, mouseEvent: React.MouseEvent) => void;
    closeDropdown: () => void;
};

const DropdownContext = createContext<DropdownContextType>({
    dropdownKey: null,
    dropdownPosition: null,
    openDropdown: () => {},
    closeDropdown: () => {},
});

export default DropdownContext;