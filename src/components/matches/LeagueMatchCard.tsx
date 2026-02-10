import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { assets } from "@/assets/images";

interface LeagueMatchCardProps {
  match: {
    fixture: {
      id: number;
      date: string;
    };
    teams: {
      home: {
        name: string;
        logo: string;
      };
      away: {
        name: string;
        logo: string;
      };
    };
  };
}

export const LeagueMatchCard = ({ match }: LeagueMatchCardProps) => (
  <div className="bg-[#0f0f0f] rounded-lg p-3 border border-border">
    <div className="flex flex-col gap-2">
      {/* Match time and date */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          {format(new Date(match.fixture.date), 'EEE, MMM d')}
        </div>
        <div className="text-sm font-medium">
          {format(new Date(match.fixture.date), 'HH:mm')}
        </div>
      </div>
      
      {/* Teams */}
      <div className="flex items-center justify-between">
        {/* Home team */}
        <div className="flex-1 flex items-center justify-end gap-1">
          <span className="text-xs font-medium text-right">{match.teams.home.name}</span>
          <div className="w-6 h-6 flex-shrink-0 relative">
            <img 
              src={match.teams.home.logo} 
              alt={match.teams.home.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = assets.preloader;
              }}
            />
          </div>
        </div>
        
        {/* VS */}
        <div className="mx-2 text-muted-foreground text-sm font-medium">vs</div>
        
        {/* Away team */}
        <div className="flex-1 flex items-center gap-1">
          <div className="w-6 h-6 flex-shrink-0 relative">
            <img 
              src={match.teams.away.logo} 
              alt={match.teams.away.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = assets.preloader;
              }}
            />
          </div>
          <span className="text-xs font-medium">{match.teams.away.name}</span>
        </div>
      </div>
      
      {/* View Match Button */}
      <div className="mt-1">
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-xs"
        >
          <Link to={`/matches/${match.fixture.id}`}>
            View
          </Link>
        </Button>
      </div>
    </div>
  </div>
);
