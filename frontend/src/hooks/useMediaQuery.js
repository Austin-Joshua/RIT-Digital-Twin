import { useState, useEffect } from 'react';

/**
 * Responsive breakpoint hook.
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 */
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

export default useMediaQuery;
