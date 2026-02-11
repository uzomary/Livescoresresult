import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PlayerProfileProps {
  playerId: string;
  onBack: () => void;
}

interface PlayerDetails {
  idPlayer: string;
  strPlayer: string;
  strTeam: string;
  strTeam2?: string;
  strCutout?: string;
  strThumb?: string;
  strPosition?: string;
  strNationality?: string;
  strHeight?: string;
  strWeight?: string;
  strBirthLocation?: string;
  dateBorn?: string;
  strDescriptionEN?: string;
  strFacebook?: string;
  strInstagram?: string;
  strTwitter?: string;
  strWage?: string;
  strSigning?: string;
  strKit?: string;
  strRender?: string;
  strSide?: string;
}

export const PlayerProfile = ({ playerId, onBack }: PlayerProfileProps) => {
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/lookupplayer.php?id=${playerId}`
        );
        const data = await response.json();

        if (data.players && data.players.length > 0) {
          setPlayer(data.players[0]);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        console.error('Error fetching player details:', err);
        setError('Failed to load player details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerDetails();
    }
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <p>No player data available</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 px-0 hover:bg-transparent hover:underline"
      >
        ← Back to search
      </Button>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={player.strCutout || player.strThumb || '/player-placeholder.png'}
                alt={player.strPlayer}
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-lg border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/player-placeholder.png';
                }}
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{player.strPlayer}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                {player.strPosition && (
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {player.strPosition}
                  </div>
                )}
                {player.strTeam && (
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {player.strTeam}
                  </div>
                )}
                {player.strNationality && (
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {player.strNationality}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-300">Height</p>
                  <p className="font-medium">{player.strHeight || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-300">Weight</p>
                  <p className="font-medium">{player.strWeight || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-300">Born</p>
                  <p className="font-medium">
                    {player.dateBorn ? formatDate(player.dateBorn) : 'N/A'}
                    {player.strBirthLocation && ` in ${player.strBirthLocation}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Market Value</p>
                  <p className="font-medium">
                    {player.strSigning || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-center md:justify-start">
                {player.strFacebook && (
                  <a
                    href={`https://facebook.com/${player.strFacebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                )}
                {player.strTwitter && (
                  <a
                    href={`https://twitter.com/${player.strTwitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                )}
                {player.strInstagram && (
                  <a
                    href={`https://instagram.com/${player.strInstagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-pink-500 transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.7-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {player.strDescriptionEN && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Biography</h2>
            <p className="text-muted-foreground leading-relaxed">
              {player.strDescriptionEN}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlayerProfile;
