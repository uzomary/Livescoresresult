import { useQuery } from '@tanstack/react-query';
import { fetchSeasonMatchesByLeagueId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from '@/components/matches/MatchCard';
import { Match } from '@/utils/fixtureTransform';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { adaptApiEventToMatch } from '@/lib/adapters';
import { Link } from 'react-router-dom';
import { createMatchUrl } from '@/utils/routing';

interface LeagueMatchesProps {
  leagueId: string | number;
  country?: string;
  leagueName?: string;
  season?: number | string;
}

export const LeagueMatches = ({ leagueId, country = '', leagueName = '', season }: LeagueMatchesProps) => {
  const { data: rawMatches, isLoading, isError, error } = useQuery({
    queryKey: ['seasonMatches', leagueId, season],
    queryFn: () => fetchSeasonMatchesByLeagueId(leagueId.toString(), season?.toString()),
    enabled: !!leagueId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[76px] w-full" />
        ))}
      </div>
    );
  }

  if (isError || !rawMatches) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not fetch matches. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (rawMatches.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Matches Found</AlertTitle>
        <AlertDescription>
          There are no matches available for this competition for the current season.
        </AlertDescription>
      </Alert>
    )
  }

  const adaptedMatches = rawMatches.map(event => adaptApiEventToMatch(event, country, leagueName));

  const matchesByDate = adaptedMatches.reduce((acc, match) => {
    const date = match.date;
    if (date && !acc[date]) {
      acc[date] = [];
    }
    if (date) {
      acc[date].push(match);
    }
    return acc;
  }, {} as Record<string, Match[]>);

  const sortedDates = Object.keys(matchesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-6">
      {sortedDates.map(date => {
        const dateObj = new Date(date);
        const formattedDate = isNaN(dateObj.getTime())
          ? 'Date Unavailable'
          : format(dateObj, 'EEEE, MMMM d, yyyy');

        return (
          <div key={date}>
            <h3 className="text-base font-semibold mb-3 text-muted-foreground">{formattedDate}</h3>
            <div className="space-y-4">
              {matchesByDate[date].map(match => (
                <Link key={match.id} to={createMatchUrl(match.homeTeam.name, match.awayTeam.name, match.id)} state={{ match }} className="block group">
                  <MatchCard match={match} />
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
};
