import React from 'react';
import { TeamLogo } from './TeamLogo';
import { Skeleton } from '@/components/ui/skeleton';

interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
  photo: string;
}

interface Team {
  id: number;
  name: string;
  logo: string;
  colors: {
    player: {
      primary: string;
      number: string;
      border: string;
    };
  };
}

interface MatchPitchProps {
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: Player[];
  awayLineup: Player[];
  isLoading?: boolean;
}

const GRID_POSITIONS = {
  'G': { top: '5%', left: '50%' },
  'D1': { top: '20%', left: '20%' },
  'D2': { top: '20%', left: '50%' },
  'D3': { top: '20%', left: '80%' },
  'M1': { top: '35%', left: '10%' },
  'M2': { top: '35%', left: '35%' },
  'M3': { top: '35%', left: '65%' },
  'M4': { top: '35%', left: '90%' },
  'F1': { top: '50%', left: '25%' },
  'F2': { top: '50%', left: '50%' },
  'F3': { top: '50%', left: '75%' },
};

export const MatchPitch: React.FC<MatchPitchProps> = ({
  homeTeam,
  awayTeam,
  homeLineup = [],
  awayLineup = [],
  isLoading = false,
}) => {
  // Sort players by position (G -> D -> M -> F)
  const sortPlayers = (players: Player[]) => {
    const positionOrder: Record<string, number> = { 'G': 0, 'D': 1, 'M': 2, 'F': 3 };
    return [...players].sort((a, b) => {
      const posA = a.pos?.[0] || 'U';
      const posB = b.pos?.[0] || 'U';
      return (positionOrder[posA] || 4) - (positionOrder[posB] || 4) || a.number - b.number;
    });
  };

  const sortedHomeLineup = sortPlayers(homeLineup);
  const sortedAwayLineup = sortPlayers(awayLineup);

  // Function to get grid position based on player position and index
  const getGridPosition = (player: Player, index: number, isHome: boolean) => {
    const position = player.pos?.[0];
    const positionIndex = isHome ? index : sortedAwayLineup.length - 1 - index;
    
    if (position === 'G') return GRID_POSITIONS['G'];
    
    // For other positions, distribute based on formation
    const positionKey = `${position}${positionIndex + 1}`;
    return GRID_POSITIONS[positionKey as keyof typeof GRID_POSITIONS] || 
      { top: '50%', left: '50%' };
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-8 w-48 mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Home Team */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <TeamLogo teamName={homeTeam.name} logoUrl={homeTeam.logo} className="w-6 h-6" />
          <h3 className="font-medium">{homeTeam.name}</h3>
        </div>
      </div>

      {/* Pitch */}
      <div className="relative aspect-[3/4] bg-green-600 rounded-lg overflow-hidden border-4 border-gray-200 shadow-lg">
        {/* Pitch markings */}
        <div className="absolute inset-0 border-[3px] border-white/30 rounded">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
          
          {/* Home penalty area */}
          <div className="absolute top-0 left-1/2 w-3/4 h-1/3 border-l-2 border-r-2 border-b-2 border-white/30 transform -translate-x-1/2">
            <div className="absolute bottom-0 left-1/2 w-1/3 h-1/4 border-l-2 border-r-2 border-t-2 border-white/30 transform -translate-x-1/2"></div>
          </div>
          
          {/* Away penalty area */}
          <div className="absolute bottom-0 left-1/2 w-3/4 h-1/3 border-l-2 border-r-2 border-t-2 border-white/30 transform -translate-x-1/2">
            <div className="absolute top-0 left-1/2 w-1/3 h-1/4 border-l-2 border-r-2 border-b-2 border-white/30 transform -translate-x-1/2"></div>
          </div>
        </div>

        {/* Home team players */}
        <div className="absolute top-0 left-0 right-0 h-1/2">
          {sortedHomeLineup.map((player, index) => {
            const position = getGridPosition(player, index, true);
            return (
              <div 
                key={`home-${player.id}`}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                style={position}
              >
                <div className="w-10 h-10 rounded-full bg-white/90 border-2 border-gray-300 overflow-hidden flex items-center justify-center shadow-md">
                  {player.photo ? (
                    <img 
                      src={player.photo} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/player-placeholder.png';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{player.number}</span>
                  )}
                </div>
                <div className="mt-1 text-xs font-medium text-white text-shadow bg-black/50 px-1 rounded whitespace-nowrap">
                  {player.number}
                </div>
              </div>
            );
          })}
        </div>

        {/* Away team players */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2">
          {sortedAwayLineup.map((player, index) => {
            const position = getGridPosition(player, index, false);
            return (
              <div 
                key={`away-${player.id}`}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                style={position}
              >
                <div className="w-10 h-10 rounded-full bg-white/90 border-2 border-gray-300 overflow-hidden flex items-center justify-center shadow-md">
                  {player.photo ? (
                    <img 
                      src={player.photo.replace('\$\{format\}', 'medium').replace('\$\{size\}', 'medium')} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/player-placeholder.png';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{player.number}</span>
                  )}
                </div>
                <div className="mt-1 text-xs font-medium text-white text-shadow bg-black/50 px-1 rounded whitespace-nowrap">
                  {player.number}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Away Team */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-2">
          <TeamLogo teamName={awayTeam.name} logoUrl={awayTeam.logo} className="w-6 h-6" />
          <h3 className="font-medium">{awayTeam.name}</h3>
        </div>
      </div>
    </div>
  );
};
