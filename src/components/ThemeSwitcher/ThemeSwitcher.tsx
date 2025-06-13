import { useState, type CSSProperties, useEffect } from "react";
import { Icons } from "../../constants/icon.constants";
import { useTheme } from "../../utils/useTheme";

function ThemeSwitcher({ home }: { home: boolean }) {
    
    const [darkModeIcon, setDarkModeIcon] = useState<Icons>(Icons.DARK_MODE_SYSTEM);
    const [darkModeIconPosition, setDarkModeIconPosition] = useState<string>('50%');
    const { prefersDark, cycleTheme } = useTheme();


    const darkModeIconStyles: CSSProperties = {
        transition: 'all 0.3s ease',
        left: darkModeIconPosition,
        transform: 'translateX(-50%)',
    }

    const handleCycleTheme = (e: React.MouseEvent) => {
        e.stopPropagation();
        cycleTheme();
    }

    useEffect(() => {
        setDarkModeIcon(
            prefersDark === false
                ? Icons.LIGHT_MODE
                : prefersDark === null
                    ? Icons.DARK_MODE_SYSTEM
                    : Icons.DARK_MODE
        );
        setDarkModeIconPosition(
            prefersDark === false
                ? '0'
                : prefersDark === null
                    ? '50%'
                    : '100%'
        );
    }, [prefersDark]);

    return (
        <div className={`${home ? 'fixed top-8 right-8' : 'relative'} w-16 h-4 rounded-box bg-base-300 border border-base-content group cursor-pointer`} onClick={(e) => handleCycleTheme(e)}>
                <i className={`${darkModeIcon} absolute top-1/2 transform translate-y-[-50%] text-lg text-primary-content p-2 bg-primary rounded-box`} style={darkModeIconStyles}></i>
                {home && 
                    <p className="absolute left-1/2 bottom-[-300%] transform translate-x-[-50%] rounded-box pl-3 pr-3 m-0 bg-base-300 text-lg text-base-content opacity-0 group-hover:opacity-100 transition-all duration-[0.3s] pointer-events-none">
                        {prefersDark === false
                            ? 'Light'
                            : prefersDark === null
                                ? 'System'
                                : 'Dark'
                        }
                    </p>
                }
            </div>
    );
};

export default ThemeSwitcher;