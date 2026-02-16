import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { footballApi } from '@/services/footballApi';
import { MatchCard } from '@/components/matches/MatchCard';
import MatchDetails from '@/components/MatchDetails';
import MetaTags from '@/components/MetaTags';

import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addDays, subDays, format } from 'date-fns';
import { transformFixtureData, Match } from '@/utils/fixtureTransform';
import SlidingCalendar from '@/components/SlidingCalendar';
import MatchFilter from '@/components/MatchFilter';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';

const Fixtures = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchFilter, setMatchFilter] = useState<'all' | 'finished' | 'upcoming'>('all');
  const navigate = useNavigate();
  const { navigateToMatch } = useMatchNavigation();

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const {
    data: fixturesData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['fixtures', formattedDate],
    queryFn: async () => {
      // Fetching fixtures for date
      try {
        const data = await footballApi.getFixturesByDate(formattedDate);
        // If we get an empty response, that's fine - just return empty array
        if (!data?.response) {
          // No fixtures found for the selected date
          return { response: [] };
        }
        return data;
      } catch (error) {
        // Error in queryFn
        // Return empty data structure instead of throwing to prevent UI crash
        return {
          get: 'fixtures',
          parameters: { date: formattedDate },
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          response: [],
          results: 0,
          paging: { current: 1, total: 0 }
        };
      }
    },
    // Enable automatic refetching when the date changes
    enabled: !!formattedDate,
    // Cache the results for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry logic - don't retry on 404 errors, otherwise retry once
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 1; // Only retry once for other errors
    },
    retryDelay: 1000,
    // Show previous data while loading new data
    placeholderData: (previousData) => previousData,
    // Don't show loading state during background refetches
    refetchOnWindowFocus: false,
    // Don't refetch on mount if we have data
    refetchOnMount: false
  });

  // Handle date changes
  const handleDateSelect = (date: Date) => {
    // Selected new date
    setSelectedDate(date);
    // The query will automatically refetch because the queryKey changed
  };

  // Handle retry
  const handleRetry = () => {
    // Retrying fetch
    refetch();
  };

  // Log results and errors
  useMemo(() => {
    if (error) {
      // Error fetching fixtures
    } else if (fixturesData) {
      const count = Array.isArray(fixturesData.response) ? fixturesData.response.length : 0;
      // Successfully fetched fixtures
    }
  }, [fixturesData, error, dataUpdatedAt]);

  const transformedMatches = useMemo(() => {
    if (!fixturesData?.response || !Array.isArray(fixturesData.response)) return [];
    try {
      const matches = transformFixtureData(fixturesData.response);
      // Transformed matches
      return matches;
    } catch (err) {
      // Error transforming fixtures
      return [];
    }
  }, [fixturesData]);

  const handleMatchClick = (match: Match) => {
    navigateToMatch(match);
  };

  const handleLeagueClick = (league: { name: string; country: string; id: number }) => {
    // Match the URL structure used in the Leagues component
    navigate(`/leagues/${encodeURIComponent(league.country)}/${encodeURIComponent(league.name)}`);
  };

  // Filter matches based on selected filter
  const filteredMatches = transformedMatches.filter(match => {
    if (matchFilter === 'all') return match.status === 'FT' || match.status === 'SCHEDULED' || ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(match.status);
    if (matchFilter === 'finished') return match.status === 'FT';
    if (matchFilter === 'upcoming') return match.status === 'SCHEDULED';
    return false;
  });

  // Define the type for grouped league matches
  interface GroupedLeagueMatches {
    id: number;
    name: string;
    logo: string;
    country: string;
    flag: string;
    matches: Match[];
  }

  // Group matches by league with country and flag info
  const groupedMatches = filteredMatches.reduce<Record<string, GroupedLeagueMatches>>((acc, match) => {
    const leagueKey = `${match.league.id}-${match.league.name}`;
    if (!acc[leagueKey]) {
      acc[leagueKey] = {
        id: match.league.id,
        name: match.league.name,
        logo: match.league.logo,
        country: match.league.country,
        flag: match.league.flag,
        matches: []
      };
    }
    acc[leagueKey].matches.push(match);
    return acc;
  }, {} as Record<string, {
    id: number;
    name: string;
    logo: string;
    country: string;
    flag: string;
    matches: Match[];
  }>);

  // Define priority leagues (FIFA Club World Cup and top 5 European leagues)
  const priorityLeagues = [
    'UEFA Champions League',
    'UEFA Europa League',
    'UEFA Europa Conference League',
    'Premier League',
    'FA Cup',
    'Carabao Cup',
    'La Liga',
    'Copa del Rey',
    'Serie A',
    'Coppa Italia',
    'Bundesliga',
    'DFB Pokal',
    'Ligue 1',
    'Coupe de France'
  ];

  // Sort grouped matches with priority leagues first, then by country and league name
  const sortedGroupedMatches = Object.values(groupedMatches).sort((a, b) => {
    const aPriorityIndex = priorityLeagues.findIndex(name => a.name.includes(name));
    const bPriorityIndex = priorityLeagues.findIndex(name => b.name.includes(name));

    // If both are in priority list, sort by their position in the priority list
    if (aPriorityIndex !== -1 && bPriorityIndex !== -1) {
      return aPriorityIndex - bPriorityIndex;
    }

    // If only a is in priority list, it comes first
    if (aPriorityIndex !== -1) return -1;

    // If only b is in priority list, it comes first
    if (bPriorityIndex !== -1) return 1;

    // If neither is in priority list, sort by country and then league name
    if (a.country < b.country) return -1;
    if (a.country > b.country) return 1;
    return a.name.localeCompare(b.name);
  });

  // Group by country for better organization
  const matchesByCountry = sortedGroupedMatches.reduce<Record<string, GroupedLeagueMatches[]>>((acc, league) => {
    if (!acc[league.country]) {
      acc[league.country] = [];
    }
    acc[league.country].push(league);
    return acc;
  }, {});

  // Add a loading state to prevent flash of black screen
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MetaTags
        title="Football Fixtures & Live Scores | livescoreresult"
        description={`Football fixtures and live scores for ${format(selectedDate, 'MMMM d, yyyy')}. Get real-time match updates, results and upcoming fixtures from all major leagues.`}
        url="/fixtures"
      />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl pb-20 md:pb-6">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-foreground p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Fixtures
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Live scores and upcoming matches
            </p>
          </div>
        </div>

        {/* Sliding Calendar */}
        <div className="mb-6">
          <SlidingCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
          <div className="text-center mt-2 text-sm text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Match Filter */}
        <MatchFilter
          selectedFilter={matchFilter}
          onFilterChange={setMatchFilter}
        />

        {isLoading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-muted/20" />
            ))}
          </div>
        )}

        {error && (
          <Card className="p-6 sm:p-8 text-center bg-card/50 border border-red-500/20">
            <h3 className="font-semibold mb-2 text-red-400">Unable to Load Fixtures</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading fixtures. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary text-black"
            >
              Retry
            </Button>
          </Card>
        )}

        {isLoading && !isRefetching ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-muted/20" />
            ))}
          </div>
        ) : isError ? (
          <Card className="p-6 text-center bg-card/50 border border-red-500/20">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Unable to Load Fixtures</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error?.message || 'Failed to fetch fixtures. Please check your connection and try again.'}
                </p>
              </div>
              <Button
                onClick={handleRetry}
                variant="default"
                className="bg-primary text-black hover:bg-primary/90"
                disabled={isRefetching}
              >
                {isRefetching ? 'Loading...' : 'Try Again'}
              </Button>
            </div>
          </Card>
        ) : Object.keys(matchesByCountry).length === 0 ? (
          <Card className="p-8 text-center bg-card/50">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-12 h-12 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No Matches Found</h3>
              <p className="text-sm text-muted-foreground">
                There are no matches scheduled for {format(selectedDate, 'MMMM d, yyyy')}.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setSelectedDate(new Date())}
              >
                View Today's Matches
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(matchesByCountry).map(([country, leagues]) => (
              <div key={country} className="space-y-4">
                {/* Country Header */}
                <div className="flex items-center gap-2">
                  {leagues[0]?.flag && (
                    <img
                      src={leagues[0].flag}
                      alt={country}
                      className="w-4 h-3 rounded-sm object-cover"
                    />
                  )}
                  <h3 className="text-sm font-medium text-muted-foreground">{country}</h3>
                </div>

                {/* Leagues in this country */}
                <div className="space-y-6">
                  {leagues.map((league) => (
                    <div key={league.id} className="space-y-3">
                      {/* League Header */}
                      <div
                        className="flex items-center gap-3 pb-1 border-b border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleLeagueClick(league)}
                      >
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-5 h-5 object-contain"
                        />
                        <h4 className="text-base font-semibold text-foreground">{league.name}</h4>
                        <Badge variant="secondary" className="ml-auto bg-muted/20 text-foreground">
                          {league.matches.length}
                        </Badge>
                      </div>

                      {/* Matches for this league */}
                      <div className="space-y-2">
                        {league.matches.map((match) => (
                          <div key={match.id} onClick={() => handleMatchClick(match)}>
                            <MatchCard
                              match={match}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && Object.keys(groupedMatches).length === 0 && (
          <Card className="p-6 sm:p-8 text-center bg-card/50 border border-white/10">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-foreground">No Matches Found</h3>
            <p className="text-sm text-muted-foreground">
              There are no {matchFilter === 'all' ? '' : matchFilter} matches for {format(selectedDate, 'MMMM d, yyyy')}.
            </p>
          </Card>
        )}
      </main>

      {/* Match Details Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {selectedMatch && (
            <MatchDetails
              matchId={selectedMatch.id.toString()}
              onBack={() => setSelectedMatch(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fixtures;
