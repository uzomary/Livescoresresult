
import React, { useState } from 'react';
import { ApiSportsLineup } from '@/lib/api-sports';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FootballPitchLineupProps {
  homeLineup: ApiSportsLineup | null;
  awayLineup: ApiSportsLineup | null;
  fixtureId: number;
}

interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

interface PlayerModalProps {
  player: any;
  team: any;
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats | null;
}

const PlayerModal = ({ player, team, isOpen, onClose, stats }: PlayerModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{player?.name}</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{player?.number}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{player?.name}</h3>
            <p className="text-muted-foreground">{player?.pos}</p>
            <p className="text-sm text-muted-foreground">{team?.name}</p>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.goals}</div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.assists}</div>
              <div className="text-sm text-muted-foreground">Assists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.yellowCards}</div>
              <div className="text-sm text-muted-foreground">Yellow Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.redCards}</div>
              <div className="text-sm text-muted-foreground">Red Cards</div>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

const PlayerDot = ({ 
  player, 
  team, 
  position, 
  isHome, 
  onClick 
}: { 
  player: any; 
  team: any; 
  position: { x: number; y: number }; 
  isHome: boolean;
  onClick: () => void;
}) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
    style={{ left: `${position.x}%`, top: `${position.y}%` }}
    onClick={onClick}
  >
    <div 
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-110 ${
        isHome ? 'bg-blue-600' : 'bg-red-600'
      }`}
    >
      {player.number}
    </div>
    <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      {player.name}
    </div>
  </div>
);

export const FootballPitchLineup = ({ homeLineup, awayLineup, fixtureId }: FootballPitchLineupProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  const handlePlayerClick = async (player: any, team: any) => {
    setSelectedPlayer(player);
    setSelectedTeam(team);
    setIsModalOpen(true);
    
    // Mock player stats - in a real app, you'd fetch this from the API
    setPlayerStats({
      goals: Math.floor(Math.random() * 10),
      assists: Math.floor(Math.random() * 8),
      yellowCards: Math.floor(Math.random() * 3),
      redCards: Math.floor(Math.random() * 2),
      minutesPlayed: 90
    });
  };

  const getPlayerPositions = (formation: string, isHome: boolean) => {
    const positions: { [key: string]: { x: number; y: number }[] } = {
      '4-4-2': [
        { x: 50, y: isHome ? 5 : 95 }, // GK
        { x: 15, y: isHome ? 25 : 75 }, { x: 35, y: isHome ? 25 : 75 }, // Defense
        { x: 65, y: isHome ? 25 : 75 }, { x: 85, y: isHome ? 25 : 75 },
        { x: 25, y: isHome ? 50 : 50 }, { x: 45, y: isHome ? 50 : 50 }, // Midfield
        { x: 55, y: isHome ? 50 : 50 }, { x: 75, y: isHome ? 50 : 50 },
        { x: 35, y: isHome ? 75 : 25 }, { x: 65, y: isHome ? 75 : 25 } // Forward
      ],
      '4-3-3': [
        { x: 50, y: isHome ? 5 : 95 }, // GK
        { x: 15, y: isHome ? 25 : 75 }, { x: 35, y: isHome ? 25 : 75 }, // Defense
        { x: 65, y: isHome ? 25 : 75 }, { x: 85, y: isHome ? 25 : 75 },
        { x: 30, y: isHome ? 50 : 50 }, { x: 50, y: isHome ? 50 : 50 }, // Midfield
        { x: 70, y: isHome ? 50 : 50 },
        { x: 25, y: isHome ? 75 : 25 }, { x: 50, y: isHome ? 75 : 25 }, // Forward
        { x: 75, y: isHome ? 75 : 25 }
      ],
      '3-5-2': [
        { x: 50, y: isHome ? 5 : 95 }, // GK
        { x: 25, y: isHome ? 25 : 75 }, { x: 50, y: isHome ? 25 : 75 }, // Defense
        { x: 75, y: isHome ? 25 : 75 },
        { x: 15, y: isHome ? 50 : 50 }, { x: 30, y: isHome ? 50 : 50 }, // Midfield
        { x: 50, y: isHome ? 50 : 50 }, { x: 70, y: isHome ? 50 : 50 },
        { x: 85, y: isHome ? 50 : 50 },
        { x: 40, y: isHome ? 75 : 25 }, { x: 60, y: isHome ? 75 : 25 } // Forward
      ]
    };
    
    return positions[formation] || positions['4-4-2'];
  };

  if (!homeLineup && !awayLineup) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>Lineup information not available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-green-600 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {/* Football pitch background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150">
          {/* Pitch outline */}
          <rect x="5" y="5" width="90" height="140" fill="none" stroke="white" strokeWidth="0.5"/>
          
          {/* Center line */}
          <line x1="5" y1="75" x2="95" y2="75" stroke="white" strokeWidth="0.5"/>
          
          {/* Center circle */}
          <circle cx="50" cy="75" r="9" fill="none" stroke="white" strokeWidth="0.5"/>
          
          {/* Penalty areas */}
          <rect x="22" y="5" width="56" height="16" fill="none" stroke="white" strokeWidth="0.5"/>
          <rect x="22" y="129" width="56" height="16" fill="none" stroke="white" strokeWidth="0.5"/>
          
          {/* Goal areas */}
          <rect x="39" y="5" width="22" height="6" fill="none" stroke="white" strokeWidth="0.5"/>
          <rect x="39" y="139" width="22" height="6" fill="none" stroke="white" strokeWidth="0.5"/>
          
          {/* Penalty spots */}
          <circle cx="50" cy="16" r="0.5" fill="white"/>
          <circle cx="50" cy="134" r="0.5" fill="white"/>
        </svg>
        
        {/* Home team players */}
        {homeLineup && homeLineup.startXI.map((playerData, index) => {
          const positions = getPlayerPositions(homeLineup.formation, true);
          const position = positions[index] || { x: 50, y: 50 };
          
          return (
            <PlayerDot
              key={`home-${playerData.player.id}`}
              player={playerData.player}
              team={homeLineup.team}
              position={position}
              isHome={true}
              onClick={() => handlePlayerClick(playerData.player, homeLineup.team)}
            />
          );
        })}
        
        {/* Away team players */}
        {awayLineup && awayLineup.startXI.map((playerData, index) => {
          const positions = getPlayerPositions(awayLineup.formation, false);
          const position = positions[index] || { x: 50, y: 50 };
          
          return (
            <PlayerDot
              key={`away-${playerData.player.id}`}
              player={playerData.player}
              team={awayLineup.team}
              position={position}
              isHome={false}
              onClick={() => handlePlayerClick(playerData.player, awayLineup.team)}
            />
          );
        })}
      </div>
      
      {/* Formation info */}
      <div className="flex justify-between mt-4 text-sm">
        {homeLineup && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>{homeLineup.team.name} ({homeLineup.formation})</span>
          </div>
        )}
        {awayLineup && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span>{awayLineup.team.name} ({awayLineup.formation})</span>
          </div>
        )}
      </div>
      
      <PlayerModal
        player={selectedPlayer}
        team={selectedTeam}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={playerStats}
      />
    </div>
  );
};
