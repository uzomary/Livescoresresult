import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { createMatchUrl } from '../utils/routing';
import { Match } from '../utils/fixtureTransform';

export const useMatchNavigation = () => {
    const navigate = useNavigate();

    const navigateToMatch = useCallback((match: Match) => {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        const url = createMatchUrl(match.homeTeam.name, match.awayTeam.name, match.id);

        if (isPWA) {
            // In PWA, stay in the app
            navigate(url);
        } else {
            // In browser, open in new tab
            window.open(url, '_blank');
        }
    }, [navigate]);

    return { navigateToMatch };
};
