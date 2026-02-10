// Update useLeague.ts
import { useQuery } from '@tanstack/react-query';
import { getLeagueById, searchLeagues } from '@/services/theSportsDbApi';
import { footballApi, TeamStanding } from '@/services/footballApi';

export function useLeague(leagueId?: string) {
  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => leagueId ? getLeagueById(leagueId) : null,
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useLeagueStandings(leagueId?: string, season?: string) {
  return useQuery<TeamStanding[] | null>({
    queryKey: ['league-standings', leagueId, season],
    queryFn: async () => {
      if (!leagueId) return null;
      
      try {
        const result = await footballApi.getLeagueStandings(parseInt(leagueId), season ? parseInt(season) : undefined);
        
        // The API returns { response: TeamStanding[] }, we need to extract the standings array
        if (result && result.response && Array.isArray(result.response) && result.response.length > 0) {
          return result.response;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching league standings:', error);
        throw error;
      }
    },
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 15, // 15 minutes for live updates
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for live matches
    refetchIntervalInBackground: false, // Stop refetching when tab is inactive
  });
}

export function useSearchLeagues(query: string) {
  return useQuery({
    queryKey: ['leagues', query],
    queryFn: () => searchLeagues(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}