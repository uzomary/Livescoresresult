
const FAVORITES_KEY = 'livescore_favorite_matches';

export const favoritesService = {
    getFavorites: (): string[] => {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    toggleFavorite: (matchId: string): boolean => {
        const favorites = favoritesService.getFavorites();
        const index = favorites.indexOf(matchId);
        let isNowFavorite = false;

        if (index > -1) {
            favorites.splice(index, 1);
            isNowFavorite = false;
        } else {
            favorites.push(matchId);
            isNowFavorite = true;
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('favorites-updated', {
            detail: { matchId, isFavorite: isNowFavorite }
        }));

        return isNowFavorite;
    },

    isFavorite: (matchId: string): boolean => {
        const favorites = favoritesService.getFavorites();
        return favorites.includes(matchId);
    }
};
