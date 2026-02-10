import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { getLeagues } from "@/services/leagueService";
import { TOP_LEAGUES } from "@/data/topLeagues";
import { Link } from 'react-router-dom';
import { assets } from '@/assets/images';

interface LeagueCardProps {
  id: number;
  name: string;
  logo: string;
  country: string;
}

function LeagueCard({ id, name, logo, country }: LeagueCardProps) {
  return (
    <Link to={`/leagues/${id}`} className="block h-full">
      <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className="w-16 h-16 object-contain mb-2"
          onError={(e) => {
            (e.target as HTMLImageElement).src = assets.preloader;
          }}
        />
        <span className="text-sm font-medium text-center">{name}</span>
        <span className="text-xs text-muted-foreground">{country}</span>
      </div>
    </Link>
  );
}

export function TopLeagues() {
  const { data: allLeagues, isLoading } = useQuery({
    queryKey: ['leagues'],
    queryFn: getLeagues,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Top Leagues</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4 border rounded-lg">
              <Skeleton className="w-16 h-16 rounded-full mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Define priority order for top leagues with both name and country for precise matching
  // Ordered as per user's preference
  const leaguePriority = [
    // User's specified top 10 leagues
    { name: 'Premier League', country: 'England', rank: 1 },
    { name: 'La Liga', country: 'Spain', rank: 2 },
    { name: 'Serie A', country: 'Italy', rank: 3 },
    { name: 'Bundesliga', country: 'Germany', rank: 4 },
    { name: 'Ligue 1', country: 'France', rank: 5 },
    { name: 'Eredivisie', country: 'Netherlands', rank: 6 },
    { name: 'Primeira Liga', country: 'Portugal', rank: 7 },
    { name: 'Belgian Pro League', country: 'Belgium', rank: 8 },
    { name: 'Süper Lig', country: 'Turkey', rank: 9 },
    { name: 'Czech First League', country: 'Czech Republic', rank: 10 },
    
    // Other notable competitions (kept at the end as they're special cases)
    { name: 'UEFA Champions League', country: 'UEFA', rank: 0 },
    { name: 'UEFA Europa League', country: 'UEFA', rank: 0 },
    { name: 'UEFA Europa Conference League', country: 'UEFA', rank: 0 },
    { name: 'FIFA Club World Cup', country: 'FIFA', rank: 0 },
    { name: 'FIFA World Cup', country: 'FIFA', rank: 0 }
  ];

  // Filter, map, and sort top leagues by priority
  const topLeagues = allLeagues
    ?.filter(league => {
      // Match both name and country to avoid incorrect matches
      const topLeague = leaguePriority.find(lp => 
        lp.name === league.name && 
        lp.country.toLowerCase() === league.country?.toLowerCase()
      );
      return !!topLeague;
    })
    .map(league => {
      // Find the matching priority league to ensure we have the correct country and rank
      const priorityLeague = leaguePriority.find(lp => 
        lp.name === league.name && 
        lp.country.toLowerCase() === league.country?.toLowerCase()
      );
      
      return {
        ...league,
        country: priorityLeague?.country || league.country || 'International',
        rank: priorityLeague?.rank || 999 // Default high rank for non-priority leagues
      };
    })
    .sort((a, b) => {
      // Sort by rank first (lower rank = higher priority)
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      
      // If same rank, sort alphabetically by country then league name
      const countryCompare = (a.country || '').localeCompare(b.country || '');
      return countryCompare !== 0 ? countryCompare : a.name.localeCompare(b.name);
    }) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Top Leagues</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topLeagues?.map(league => (
          <LeagueCard 
            key={league.id}
            id={league.id}
            name={league.name}
            logo={league.logo}
            country={league.country}
          />
        ))}
      </div>
    </div>
  );
}
