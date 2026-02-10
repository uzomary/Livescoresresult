import { Skeleton } from "@/components/ui/skeleton";
import { useLeague } from "@/hooks/useLeague";
import { transformLeague } from "@/utils/leagueTransform";

interface LeagueInfoProps {
  leagueId: string;
}

export function LeagueInfo({ leagueId }: LeagueInfoProps) {
  const { data, isLoading, error } = useLeague(leagueId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data?.leagues?.[0]) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load league information
      </div>
    );
  }

  const league = transformLeague(data.leagues[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {league.logo && (
          <img 
            src={league.logo} 
            alt={`${league.name} logo`} 
            className="w-16 h-16 object-contain"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-muted-foreground">
            {league.country} • {league.season}
          </p>
        </div>
      </div>
      
      {league.description && (
        <div className="prose max-w-none">
          <p className="line-clamp-4 text-sm text-muted-foreground">
            {league.description}
          </p>
        </div>
      )}
      
      <div className="flex gap-4 pt-2">
        {league.website && (
          <a 
            href={league.website.startsWith('http') ? league.website : `https://${league.website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Official Website
          </a>
        )}
      </div>
    </div>
  );
}
