import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { getLeagueById } from '@/services/theSportsDbApi';
import { transformLeague } from '@/utils/leagueTransform';
import { useNavigate } from 'react-router-dom';

interface LeagueCardProps {
  leagueId: string;
  name: string;
  onClick?: () => void;
  className?: string;
  showStandingsLink?: boolean;
}

export function LeagueCard({ 
  leagueId, 
  name, 
  onClick, 
  className = '',
  showStandingsLink = true
}: LeagueCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showStandingsLink) {
      navigate(`/standings/${leagueId}`);
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ['league-card', leagueId],
    queryFn: () => getLeagueById(leagueId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const league = data?.leagues?.[0] ? transformLeague(data.leagues[0]) : null;

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center p-4 border rounded-lg ${className}`}>
        <Skeleton className="w-16 h-16 rounded-full mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {league?.logo ? (
        <img 
          src={league.logo} 
          alt={`${name} logo`}
          className="w-16 h-16 object-contain mb-2"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted mb-2 flex items-center justify-center">
          <span className="text-xs text-center">
            {name
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .substring(0, 3)}
          </span>
        </div>
      )}
      <span className="text-sm font-medium text-center">{name}</span>
      {league?.country && (
        <span className="text-xs text-muted-foreground mt-1">{league.country}</span>
      )}
    </div>
  );
}
