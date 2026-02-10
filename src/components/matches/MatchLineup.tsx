
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApiLineup } from '@/services/footballApi';

interface MatchLineupProps {
  lineup: ApiLineup;
}

export const MatchLineup = ({ lineup }: MatchLineupProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <img src={lineup.team.logo} alt={lineup.team.name} className="w-6 h-6" />
          {lineup.team.name}
          <Badge variant="outline">{lineup.formation}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Starting XI</h4>
          <div className="grid grid-cols-1 gap-2">
            {lineup.startXI.map((player) => (
              <div key={player.player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center">
                    {player.player.number || '•'}
                  </Badge>
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={`https://media.api-sports.io/football/players/${player.player.id}.png`} 
                      alt={player.player.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs">
                      {player.player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{player.player.name}</span>
                </div>
                <span className="text-xs font-medium bg-muted-foreground/10 px-2 py-1 rounded">
                  {player.player.pos}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {lineup.substitutes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Substitutes</h4>
            <div className="grid grid-cols-1 gap-2">
              {lineup.substitutes.map((player) => (
                <div key={player.player.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                      {player.player.number || '•'}
                    </Badge>
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={`https://media.api-sports.io/football/players/${player.player.id}.png`} 
                        alt={player.player.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {player.player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{player.player.name}</span>
                  </div>
                  <span className="text-xs font-medium bg-muted-foreground/10 px-2 py-1 rounded">
                    {player.player.pos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
