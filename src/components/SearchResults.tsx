import { useEffect, useState } from 'react';
import { useSearch } from '@/layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { createMatchUrl } from '@/utils/routing';

interface Player {
  idPlayer: string;
  strPlayer: string;
  strTeam: string;
  strCutout?: string;
  strThumb?: string;
  strPosition?: string;
}

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strLeague: string;
  dateEvent: string;
  strTime: string;
}

export const SearchResults = () => {
  const { searchQuery, searchType } = useSearch();
  const navigate = useNavigate();
  const [results, setResults] = useState<Array<Player | Match>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (searchType === 'player') {
          const response = await fetch(
            `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();
          setResults(data.player ? (Array.isArray(data.player) ? data.player : [data.player]) : []);
        } else {
          // Search for matches/events
          const response = await fetch(
            `https://www.thesportsdb.com/api/v1/json/123/searchevents.php?e=${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();
          setResults(data.event ? (Array.isArray(data.event) ? data.event : [data.event]) : []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch results. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  if (!searchQuery) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute z-50 w-full max-w-md mt-2 bg-background rounded-lg shadow-lg border">
        <div className="p-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute z-50 w-full max-w-md mt-2 bg-background rounded-lg shadow-lg border p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (results.length === 0 && searchQuery) {
    return (
      <div className="absolute z-50 w-full max-w-md mt-2 bg-background rounded-lg shadow-lg border p-4 text-muted-foreground">
        No {searchType} found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="absolute z-50 w-full max-w-md mt-2 bg-background rounded-lg shadow-lg border max-h-96 overflow-y-auto">
      <div className="p-2">
        {searchType === 'player' ? (
          (results as Player[]).map((player) => (
            <div
              key={player.idPlayer}
              className="flex items-center p-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
              onClick={() => navigate(`/player/${player.idPlayer}`)}
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted overflow-hidden">
                {player.strCutout || player.strThumb ? (
                  <img
                    src={player.strCutout || player.strThumb}
                    alt={player.strPlayer}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                  {player.strPlayer.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="font-medium">{player.strPlayer}</div>
                <div className="text-xs text-muted-foreground">
                  {player.strTeam} {player.strPosition ? `• ${player.strPosition}` : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          (results as Match[]).map((match) => (
            <div
              key={match.idEvent}
              className="p-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
              onClick={() => navigate(createMatchUrl(match.strHomeTeam, match.strAwayTeam, match.idEvent))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{match.strHomeTeam}</span>
                  <span>vs</span>
                  <span className="font-medium">{match.strAwayTeam}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {match.strLeague} • {new Date(`${match.dateEvent} ${match.strTime}`).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
