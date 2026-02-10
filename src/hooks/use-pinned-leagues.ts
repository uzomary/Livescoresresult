import { useState, useEffect } from 'react';

const STORAGE_KEY = 'livescoreresult-pinned-leagues';

export const usePinnedLeagues = () => {
    const [pinnedLeagueIds, setPinnedLeagueIds] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to parse pinned leagues', error);
            return [];
        }
    });

    const togglePin = (leagueId: string) => {
        setPinnedLeagueIds((prev) => {
            const newPinned = prev.includes(leagueId)
                ? prev.filter((id) => id !== leagueId)
                : [...prev, leagueId];

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newPinned));
            } catch (error) {
                console.error('Failed to save pinned leagues', error);
            }
            return newPinned;
        });
    };

    const isPinned = (leagueId: string) => pinnedLeagueIds.includes(leagueId);

    return { pinnedLeagueIds, togglePin, isPinned };
};
