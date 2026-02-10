
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Player {
  name: string;
  position: string;
  number?: number;
  rating?: number;
  grid?: string;
}

interface Formation {
  formation: string;
  players: Player[];
}

interface FootballPitchProps {
  formation: Formation;
  teamColor?: string;
  onPlayerClick?: (player: Player) => void;
}

const FootballPitch = ({ formation, teamColor = '#FF6400', onPlayerClick }: FootballPitchProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Enhanced formation positioning logic using grid coordinates
  const getPlayerPosition = (position: string, formationStr: string, playerIndex: number, grid?: string): { x: number; y: number } => {
    // If grid is provided, use it for positioning (format: "row:col" e.g., "1:1", "2:3")
    if (grid && grid !== '0:0') {
      const [row, col] = grid.split(':').map(Number);

      // Grid is typically 1-4 for rows (1=forward, 4=back) and 1-5 for columns
      // Convert to percentage positions on the pitch
      // Y-axis: row 1 (forward) = 15%, row 4 (back) = 75%
      const yPositions = [15, 35, 55, 75]; // Positions for rows 1-4
      const y = yPositions[row - 1] || 50;

      // X-axis: spread columns evenly across the width
      // For 5 columns: 10%, 30%, 50%, 70%, 90%
      const xPositions = [10, 30, 50, 70, 90]; // Positions for columns 1-5
      const x = xPositions[col - 1] || 50;

      return { x, y };
    }

    // Fallback to position-based logic if no grid is provided
    const formations: Record<string, Record<string, { x: number; y: number }[]>> = {
      '4-3-3': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 35, y: 70 }, { x: 65, y: 70 }],
        'LB': [{ x: 15, y: 70 }],
        'RB': [{ x: 85, y: 70 }],
        'CM': [{ x: 35, y: 50 }, { x: 50, y: 45 }, { x: 65, y: 50 }],
        'CDM': [{ x: 50, y: 55 }],
        'LW': [{ x: 25, y: 20 }],
        'RW': [{ x: 75, y: 20 }],
        'ST': [{ x: 50, y: 15 }]
      },
      '4-2-3-1': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 35, y: 70 }, { x: 65, y: 70 }],
        'LB': [{ x: 15, y: 70 }],
        'RB': [{ x: 85, y: 70 }],
        'CDM': [{ x: 40, y: 55 }, { x: 60, y: 55 }],
        'LW': [{ x: 25, y: 35 }],
        'RW': [{ x: 75, y: 35 }],
        'CAM': [{ x: 50, y: 35 }],
        'ST': [{ x: 50, y: 15 }]
      },
      '3-5-2': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 30, y: 70 }, { x: 50, y: 70 }, { x: 70, y: 70 }],
        'LWB': [{ x: 15, y: 50 }],
        'RWB': [{ x: 85, y: 50 }],
        'CM': [{ x: 35, y: 50 }, { x: 50, y: 45 }, { x: 65, y: 50 }],
        'ST': [{ x: 40, y: 15 }, { x: 60, y: 15 }]
      },
      '4-4-2': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 35, y: 70 }, { x: 65, y: 70 }],
        'LB': [{ x: 15, y: 70 }],
        'RB': [{ x: 85, y: 70 }],
        'LM': [{ x: 20, y: 45 }],
        'RM': [{ x: 80, y: 45 }],
        'CM': [{ x: 40, y: 45 }, { x: 60, y: 45 }],
        'ST': [{ x: 40, y: 15 }, { x: 60, y: 15 }]
      },
      '4-1-4-1': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 35, y: 70 }, { x: 65, y: 70 }],
        'LB': [{ x: 15, y: 70 }],
        'RB': [{ x: 85, y: 70 }],
        'CDM': [{ x: 50, y: 55 }],
        'LM': [{ x: 20, y: 40 }],
        'RM': [{ x: 80, y: 40 }],
        'CM': [{ x: 40, y: 40 }, { x: 60, y: 40 }],
        'ST': [{ x: 50, y: 15 }]
      },
      '3-4-3': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 30, y: 70 }, { x: 50, y: 70 }, { x: 70, y: 70 }],
        'LM': [{ x: 20, y: 50 }],
        'RM': [{ x: 80, y: 50 }],
        'CM': [{ x: 40, y: 50 }, { x: 60, y: 50 }],
        'LW': [{ x: 25, y: 20 }],
        'RW': [{ x: 75, y: 20 }],
        'ST': [{ x: 50, y: 15 }]
      },
      '5-3-2': {
        'GK': [{ x: 50, y: 90 }],
        'CB': [{ x: 30, y: 70 }, { x: 50, y: 70 }, { x: 70, y: 70 }],
        'LWB': [{ x: 15, y: 65 }],
        'RWB': [{ x: 85, y: 65 }],
        'CM': [{ x: 35, y: 45 }, { x: 50, y: 40 }, { x: 65, y: 45 }],
        'ST': [{ x: 40, y: 15 }, { x: 60, y: 15 }]
      }
    };

    const formationPositions = formations[formationStr] || formations['4-3-3'];
    const positionArray = formationPositions[position];

    if (positionArray && positionArray.length > 0) {
      const positionCount = formation.players.filter(p => p.position === position).length;
      const currentPositionIndex = formation.players
        .filter(p => p.position === position)
        .findIndex(p => p === formation.players[playerIndex]);

      if (positionArray.length > currentPositionIndex) {
        return positionArray[currentPositionIndex];
      }
      return positionArray[0];
    }

    return { x: 50, y: 50 };
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    onPlayerClick?.(player);
  };

  const generateRandomRating = () => {
    return (Math.random() * 3 + 6).toFixed(1); // Random rating between 6.0 and 9.0
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg">
        {/* Pitch SVG with enhanced design */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grass pattern */}
          <defs>
            <pattern id="grass" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="15" height="30" fill="#22c55e" opacity="0.3" />
              <rect x="15" y="0" width="15" height="30" fill="#16a34a" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="300" height="400" fill="url(#grass)" />

          {/* Pitch lines */}
          <g stroke="white" strokeWidth="1.5" fill="none" opacity="0.9">
            {/* Outer boundary */}
            <rect x="15" y="15" width="270" height="370" />

            {/* Center line */}
            <line x1="15" y1="200" x2="285" y2="200" />

            {/* Center circle */}
            <circle cx="150" cy="200" r="45" />
            <circle cx="150" cy="200" r="1.5" fill="white" />

            {/* Penalty areas */}
            <rect x="60" y="15" width="180" height="90" />
            <rect x="60" y="295" width="180" height="90" />

            {/* Goal areas */}
            <rect x="105" y="15" width="90" height="30" />
            <rect x="105" y="355" width="90" height="30" />

            {/* Penalty spots */}
            <circle cx="150" cy="70" r="1.5" fill="white" />
            <circle cx="150" cy="330" r="1.5" fill="white" />

            {/* Penalty arcs */}
            <path d="M 105 70 A 45 45 0 0 1 195 70" />
            <path d="M 105 330 A 45 45 0 0 0 195 330" />

            {/* Corner arcs */}
            <path d="M 15 27 A 12 12 0 0 1 27 15" />
            <path d="M 273 15 A 12 12 0 0 1 285 27" />
            <path d="M 285 373 A 12 12 0 0 1 273 385" />
            <path d="M 27 385 A 12 12 0 0 1 15 373" />

            {/* Goals */}
            <rect x="135" y="8" width="30" height="7" stroke="white" strokeWidth="2" fill="none" />
            <rect x="135" y="385" width="30" height="7" stroke="white" strokeWidth="2" fill="none" />
          </g>
        </svg>

        {/* Players */}
        {formation.players.map((player, index) => {
          const position = getPlayerPosition(player.position, formation.formation, index, player.grid);
          const rating = generateRandomRating();

          return (
            <div
              key={`${player.name}-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onClick={() => handlePlayerClick(player)}
            >
              {/* Player circle with rating */}
              <div className="relative">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-110 flex items-center justify-center text-white font-bold text-xs md:text-sm relative z-10"
                  style={{ backgroundColor: teamColor }}
                >
                  {player.number || index + 1}
                </div>

                {/* Rating badge */}
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                  style={{
                    backgroundColor: parseFloat(rating) >= 7.5 ? '#22c55e' :
                      parseFloat(rating) >= 6.5 ? '#f97316' : '#ef4444'
                  }}
                >
                  {rating}
                </div>
              </div>

              {/* Player name tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-gray-300">{player.position}</div>
              </div>
            </div>
          );
        })}

        {/* Formation label */}
        <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formation.formation}
        </div>
      </div>

      {/* Selected player info */}
      {selectedPlayer && (
        <div className="mt-4 p-3 bg-muted/80 rounded-lg border">
          <h4 className="font-semibold">{selectedPlayer.name}</h4>
          <p className="text-sm text-muted-foreground">Position: {selectedPlayer.position}</p>
          {selectedPlayer.number && (
            <p className="text-sm text-muted-foreground">Number: {selectedPlayer.number}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FootballPitch;
