
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FootballPitch from './FootballPitch';

interface Player {
  name: string;
  position: string;
  number?: number;
}

interface Formation {
  formation: string;
  players: Player[];
}

const FormationDemo = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const formations: Record<string, Formation> = {
    '4-3-3': {
      formation: '4-3-3',
      players: [
        { name: 'Goalkeeper', position: 'GK', number: 1 },
        { name: 'Left Back', position: 'LB', number: 3 },
        { name: 'Center Back', position: 'CB', number: 4 },
        { name: 'Center Back', position: 'CB', number: 5 },
        { name: 'Right Back', position: 'RB', number: 2 },
        { name: 'Defensive Mid', position: 'CDM', number: 6 },
        { name: 'Central Mid', position: 'CM', number: 8 },
        { name: 'Defensive Mid', position: 'CDM', number: 10 },
        { name: 'Left Winger', position: 'LW', number: 11 },
        { name: 'Striker', position: 'ST', number: 9 },
        { name: 'Right Winger', position: 'RW', number: 7 }
      ]
    },
    '4-2-3-1': {
      formation: '4-2-3-1',
      players: [
        { name: 'Goalkeeper', position: 'GK', number: 1 },
        { name: 'Left Back', position: 'LB', number: 3 },
        { name: 'Center Back', position: 'CB', number: 4 },
        { name: 'Center Back', position: 'CB', number: 5 },
        { name: 'Right Back', position: 'RB', number: 2 },
        { name: 'Defensive Mid', position: 'CDM', number: 6 },
        { name: 'Defensive Mid', position: 'CDM', number: 8 },
        { name: 'Left Winger', position: 'LW', number: 11 },
        { name: 'Attacking Mid', position: 'CAM', number: 10 },
        { name: 'Right Winger', position: 'RW', number: 7 },
        { name: 'Striker', position: 'ST', number: 9 }
      ]
    },
    '3-5-2': {
      formation: '3-5-2',
      players: [
        { name: 'Goalkeeper', position: 'GK', number: 1 },
        { name: 'Center Back', position: 'CB', number: 3 },
        { name: 'Center Back', position: 'CB', number: 4 },
        { name: 'Center Back', position: 'CB', number: 5 },
        { name: 'Left Wing Back', position: 'LWB', number: 12 },
        { name: 'Central Mid', position: 'CM', number: 6 },
        { name: 'Central Mid', position: 'CM', number: 8 },
        { name: 'Central Mid', position: 'CM', number: 10 },
        { name: 'Right Wing Back', position: 'RWB', number: 2 },
        { name: 'Striker', position: 'ST', number: 9 },
        { name: 'Striker', position: 'ST', number: 11 }
      ]
    }
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Football Formation Visualizer</h1>
        <p className="text-muted-foreground">Select a formation to see player positioning on the pitch</p>
      </div>

      {/* Formation selector */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border border-white/10">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(formations).map((formation) => (
            <Button
              key={formation}
              variant={selectedFormation === formation ? "default" : "outline"}
              onClick={() => setSelectedFormation(formation)}
              className="min-w-20"
            >
              {formation}
            </Button>
          ))}
        </div>
      </Card>

      {/* Football pitch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FootballPitch 
            formation={formations[selectedFormation]}
            teamColor="#FF6400"
            onPlayerClick={handlePlayerClick}
          />
        </div>

        {/* Team lineup */}
        <div className="space-y-4">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border border-white/10">
            <h3 className="font-semibold text-white mb-3">Starting XI</h3>
            <div className="space-y-2">
              {formations[selectedFormation].players.map((player, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedPlayer?.name === player.name ? 'bg-primary/20' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center"
                    >
                      {player.number}
                    </div>
                    <span className="text-white text-sm">{player.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {player.position}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {selectedPlayer && (
            <Card className="p-4 bg-card/50 backdrop-blur-sm border border-white/10">
              <h4 className="font-semibold text-white mb-2">Player Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <span className="text-white">{selectedPlayer.name}</span></p>
                <p><span className="text-muted-foreground">Position:</span> <span className="text-white">{selectedPlayer.position}</span></p>
                <p><span className="text-muted-foreground">Number:</span> <span className="text-white">{selectedPlayer.number}</span></p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationDemo;
