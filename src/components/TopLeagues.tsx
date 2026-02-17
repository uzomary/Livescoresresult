import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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

  const [customPriorities, setCustomPriorities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPriorities = async () => {
      // Import dynamically to avoid circular dependencies if any
      const { leaguePriorityService } = await import('@/services/leaguePriorityService');
      const priorities = await leaguePriorityService.getAll();
      setCustomPriorities(priorities);
    };
    fetchPriorities();
  }, []);

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

  // hardcoded defaults for non-customized setup
  const defaultPriorities: Record<string, number> = {
    'Premier League': 10,
    'La Liga': 11,
    'Serie A': 12,
    'Bundesliga': 13,
    'Ligue 1': 14,
    'Eredivisie': 15,
    'Primeira Liga': 16,
    'UEFA Champions League': 1,
    'UEFA Europa League': 2,
    'UEFA Conference League': 3,
  };

  // Merge custom priorities with defaults
  // Custom priorities take precedence. Convert array-based logic to map-based logic.
  const leaguePriorityMap = { ...defaultPriorities, ...customPriorities };

  // Filter, map, and sort top leagues by priority
  const topLeagues = allLeagues
    ?.map(league => {
      // Determine priority
      let priority = 1000;

      // 1. Exact match
      if (leaguePriorityMap[league.name] !== undefined) {
        priority = leaguePriorityMap[league.name];
      }
      // 2. Name + Country match (if key is "League (Country)")
      else if (league.country) {
        const nameWithCountry = `${league.name} (${league.country})`;
        if (leaguePriorityMap[nameWithCountry] !== undefined) {
          priority = leaguePriorityMap[nameWithCountry];
        }
      }

      return { ...league, priority };
    })
    .filter(league => league.priority < 100) // Only show prioritized leagues in this "Top Leagues" section
    .sort((a, b) => {
      // Sort by priority (lower rank = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
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
