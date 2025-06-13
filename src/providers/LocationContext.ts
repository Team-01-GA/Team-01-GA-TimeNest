import { createContext } from 'react';
import type { Location } from 'react-router-dom';

export type LocationContextType = {
    location: Location | null;
};

const LocationContext = createContext<LocationContextType>({
    location: null,
});

export default LocationContext;