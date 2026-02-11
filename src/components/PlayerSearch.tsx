import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Player {
  idPlayer: string;
  strPlayer: string;
  strTeam: string;
  strCutout?: string;
  strThumb?: string;
  strPosition?: string;
  strNationality?: string;
}

interface PlayerSearchProps {
  onSelectPlayer: (playerId: string) => void;
}

export const PlayerSearch = ({ onSelectPlayer }: PlayerSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchPlayers = async () => {
      if (!searchQuery.trim()) {
        setPlayers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();

        if (data.player) {
          setPlayers(Array.isArray(data.player) ? data.player : [data.player]);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to fetch players. Please try again.');
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPlayers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handlePlayerClick = (playerId: string) => {
    onSelectPlayer(playerId);
    setSearchQuery('');
    setPlayers([]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Search for a player..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {searchQuery && (
        <Card className="absolute z-10 w-full mt-1 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2 hover:bg-muted">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : players.length > 0 ? (
            <div className="divide-y">
              {players.map((player) => (
                <div
                  key={player.idPlayer}
                  className="flex items-center p-3 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handlePlayerClick(player.idPlayer)}
                >
                  <img
                    src={player.strCutout || player.strThumb || '/player-placeholder.png'}
                    alt={player.strPlayer}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/player-placeholder.png';
                    }}
                  />
                  <div>
                    <div className="font-medium">{player.strPlayer}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.strTeam} • {player.strPosition}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-sm text-muted-foreground">
              No players found for "{searchQuery}"
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default PlayerSearch;
