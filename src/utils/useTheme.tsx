import { useEffect, useState } from 'react';

export function useTheme() {
    const [prefersDark, setPrefersDark] = useState(() => {
        const stored = localStorage.getItem('prefersDark');
        return stored === null ? null : JSON.parse(stored);
    });

    // Apply theme on load and when `prefersDark` changes
    useEffect(() => {
        const applyTheme = () => {
            let theme: string;
            if (prefersDark === false) {
                theme = 'bumblebee';
            } else if (prefersDark === true) {
                theme = 'halloween';
            } else {
                const systemPrefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)'
                ).matches;
                theme = systemPrefersDark ? 'halloween' : 'bumblebee';
            }
            document.documentElement.setAttribute('data-theme', theme);
        };

        applyTheme();

        if (prefersDark === null) {
            const mediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)'
            );
            const handler = () => applyTheme();
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [prefersDark]);

    const cycleTheme = () => {
        const next =
            prefersDark === false ? null : prefersDark === null ? true : false;
        setPrefersDark(next);
        localStorage.setItem('prefersDark', JSON.stringify(next));
    };

    return { prefersDark, cycleTheme };
}
