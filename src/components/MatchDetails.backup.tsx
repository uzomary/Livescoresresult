import { useEffect, useState } from "react";
import PenaltyMissIcon from './icons/PenaltyMissIcon';
import YellowCardIcon from './icons/YellowCardIcon';
import RedCardIcon from './icons/RedCardIcon';
import SubstitutionIcon from './icons/SubstitutionIcon';
import FootballIcon from './icons/FootballIcon';
import VarIcon from './icons/VarIcon';
import { Trophy, Clock, MapPin, Calendar, Search } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { footballApi } from "@/services/footballApi";
import { transformFixture } from "@/utils/fixtureTransform";
import { transformEvents, transformStatistics, transformLineups, MatchEvent, MatchStatistic, TeamLineup } from "@/utils/matchDetailsTransform";
import MetaTags from "@/components/MetaTags";


interface MatchDetailsProps {
  matchId: string;
  onBack: () => void;
}

const MatchDetails = ({ matchId, onBack }: MatchDetailsProps) => {
  // MatchDetails component - Received matchId
  
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: fixtureData, isLoading: fixtureLoading, error: fixtureError } = useQuery({
    queryKey: ['fixture', matchId],
    queryFn: async () => {
      // MatchDetails - Fetching fixture
      const result = await footballApi.getFixtureById(matchId);
      // MatchDetails - Fixture data received
      return result;
    },
    enabled: !!matchId, // Only run if matchId exists
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', matchId],
    queryFn: () => footballApi.getFixtureEvents(matchId),
    enabled: !!fixtureData && !!matchId,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics', matchId],
    queryFn: () => footballApi.getFixtureStatistics(matchId),
    enabled: !!fixtureData && !!matchId,
  });

  const { data: lineupsData, isLoading: lineupsLoading } = useQuery({
    queryKey: ['lineups', matchId],
    queryFn: () => footballApi.getFixtureLineups(matchId),
    enabled: !!fixtureData && !!matchId,
  });

  // Live timer effect - MUST be declared before any conditional returns
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (fixtureData?.response?.[0]) {
      const fixture = fixtureData.response[0];
      const match = transformFixture(fixture);

      if (match.status === "LIVE") {
        // Calculate initial elapsed time based on match.minute
        const initialMinutes = match.minute ? parseInt(match.minute.toString(), 10) : 0;
        const initialSeconds = 0; // Start at 0 seconds
        const initialElapsed = (initialMinutes * 60) + initialSeconds;
        
        setElapsedSeconds(initialElapsed);
        setStartTime(Date.now() - (initialElapsed * 1000));

        // Update the timer every second
        interval = setInterval(() => {
          if (startTime) {
            const currentTime = Date.now();
            const elapsedMs = currentTime - startTime;
            const elapsed = Math.floor(elapsedMs / 1000);
            
            // Cap at 90 minutes (5400 seconds) for regular time, or 120 minutes (7200 seconds) for matches with extra time
            const maxTime = (fixture.fixture?.periods?.second ? 120 : 90) * 60;
            setElapsedSeconds(Math.min(elapsed, maxTime));
          }
        }, 1000); // Update every second
      } else {
        setElapsedSeconds(0);
        setStartTime(null);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fixtureData, startTime]);

  // NOW WE CAN DO CONDITIONAL RETURNS - AFTER ALL HOOKS
  if (!matchId) {
    // MatchDetails - No matchId provided
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground">
          ← Back to matches
        </button>
        <Card className="p-6 text-center">
          <p>No match ID provided</p>
        </Card>
      </div>
    );
  }

  if (fixtureError) {
    // Error fetching fixture
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground">
          ← Back to matches
        </button>
        <Card className="p-6 text-center">
          <p>Error loading match details. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Error: {fixtureError?.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (fixtureLoading) {
    // MatchDetails - Loading fixture
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <Card className="p-6 mb-6">
          <Skeleton className="h-32 w-full" />
        </Card>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // MatchDetails - Fixture data structure

  if (!fixtureData?.response?.[0]) {
    // MatchDetails - No fixture data found in response
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground">  
          ← Back to matches
        </button>
        <Card className="p-6 text-center">
          <p>Match not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Match ID: {matchId}
          </p>
        </Card>
      </div>
    );
  }

  // Safely access the fixture data with null checks
  const fixture = fixtureData?.response?.[0];
  
  if (!fixture) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground">
          ← Back to matches
        </button>
        <Card className="p-6 text-center">
          <p>No match data available</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const match = transformFixture(fixture);
  const events: MatchEvent[] = eventsData?.response ? transformEvents(eventsData.response, fixture.teams?.home?.id || 0) : [];
  const statistics: MatchStatistic[] = statsData?.response ? transformStatistics(statsData.response) : [];
  const lineups: TeamLineup[] = lineupsData?.response ? transformLineups(lineupsData.response) : [];

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NS":
        return { bg: "bg-muted text-muted-foreground", label: "Not Started" };
      case "LIVE":
        return { bg: "bg-green-500 text-white", label: "Live" };
      case "HT":
        return { bg: "bg-orange-500 text-white", label: "Half Time" };
      case "FT":
        return { bg: "bg-blue-500 text-white", label: "Full Time" };
      case "PST":
        return { bg: "bg-amber-500 text-white", label: "Postponed" };
      case "CANC":
        return { bg: "bg-red-500 text-white", label: "Cancelled" };
      case "SUSP":
        return { bg: "bg-yellow-500 text-white", label: "Suspended" };
      case "AET":
        return { bg: "bg-purple-500 text-white", label: "After Extra Time" };
      case "PEN":
        return { bg: "bg-pink-500 text-white", label: "Penalties" };
      default:
        return { bg: "bg-muted text-muted-foreground", label: status || "Scheduled" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "LIVE":
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" />
          </svg>
        );
      case "HT":
        return "⏱️";
      case "FT":
        return "🟢";
      case "PST":
        return "⏸️";
      case "CANC":
        return "❌";
      case "SUSP":
        return "⚠️";
      case "AET":
      case "PEN":
        return "⚽";
      default:
        return "🕒";
    }
  };

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return <FootballIcon className="w-5 h-5 text-white" />;
      case 'penalty_miss':
        return <PenaltyMissIcon className="w-5 h-5 text-red-500" />;
      case 'yellow':
        return <YellowCardIcon className="w-4 h-5 text-yellow-400" />;
      case 'red':
        return <RedCardIcon className="w-4 h-5 text-red-600" />;
      case 'substitution':
        return <SubstitutionIcon className="w-5 h-5" />;
      case 'var':
        return <VarIcon className="w-5 h-5 text-blue-400" />;
      default:
        return '•';
    }
  };

  // Group events by team for better layout
  const homeEvents = events.filter(event => event.team === 'home');
  const awayEvents = events.filter(event => event.team === 'away');

  // Convert grid position (e.g., "1-2") to x,y coordinates
  const gridToPosition = (grid: string) => {
    try {
      const [x, y] = grid.split('-').map(Number);
      // Convert grid to percentage (invert y-axis and adjust x-axis for better positioning)
      return {
        x: (x / 10) * 100,  // Convert from 1-10 to percentage
        y: 100 - ((y / 10) * 100)  // Invert y-axis so 1 is at the bottom
      };
    } catch (e) {
      // Fallback to center if grid is invalid
      return { x: 50, y: 50 };
    }
  };

  // Convert lineup data to formation structure for FootballPitch
  const convertToFormation = (lineup: TeamLineup) => {
    return {
      formation: lineup.formation,
      players: lineup.startingXI.map(player => {
        // Use grid position if available, otherwise fall back to position-based placement
        const position = player.grid 
          ? gridToPosition(player.grid)
          : { x: 50, y: 50 }; // Default to center if no grid
        
        return {
          name: player.name,
          position: player.position,
          number: player.number,
          ...position
        };
      })
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-3 py-1 sm:py-3">
      <MetaTags 
        title={`${match.homeTeam.name} vs ${match.awayTeam.name} - Live Score & Match Details`}
        description={`Live score and match details for ${match.homeTeam.name} vs ${match.awayTeam.name}. Get real-time updates, stats, lineups and commentary.`}
        url={`/match/${matchId}`}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-10">
        <button 
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm flex items-center"
        >
          ← Back to matches
        </button>
        
        
      </div>

      <Card className="p-2 sm:p-4 mb-3 sm:mb-4 bg-gradient-to-br from-muted/60 to-black/40">
        {/* Match status and timeline */}
        <div className="flex items-center justify-center mb-2">
          {match.status && (
            <div className="flex items-center">
              <Badge 
                className={`${getStatusColor(match.status).bg} text-xs font-medium`}
                variant="secondary"
              >
                {match.status === "LIVE" && match.minute 
                  ? `${getStatusColor(match.status).label} ${match.minute}'` 
                  : getStatusColor(match.status).label}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="text-center flex-1 max-w-[40%]">
            <img src={match.homeTeam.logo} alt="" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2" />
            <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{match.homeTeam.name}</h3>
          </div>

          <div className="text-center mx-2 sm:mx-4 md:mx-8 flex-shrink-0">
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 whitespace-nowrap">
              {`${match.homeTeam.score ?? 0} - ${match.awayTeam.score ?? 0}`}
            </div>
          </div>

          <div className="text-center flex-1 max-w-[40%]">
            <img src={match.awayTeam.logo} alt="" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2" />
            <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{match.awayTeam.name}</h3>
          </div>
        </div>
        
        {/* Match details at the bottom */}
       
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 overflow-x-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="lineups" className="text-xs sm:text-sm">Lineups</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm">Stats</TabsTrigger>
          <TabsTrigger value="commentary" className="text-xs sm:text-sm">Commentary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="overflow-hidden">
            {/* Teams Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted">

            </div>

            {eventsLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-0.5">
                {/* First Half Events */}
                {events
                  .filter(event => event.minute <= 45) // Filter first half events
                  .map((event, index) => (
                    <div 
                      key={`first-half-${index}`} 
                      className={`relative flex items-center ${event.team === 'home' ? 'bg-[#121212]' : 'bg-[#0a0a0a]'} hover:bg-opacity-90 transition-colors`}
                    >
                      <div className={`flex-1 py-3 ${event.team === 'home' ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}>
                        <div className={`flex items-center gap-3 ${event.team === 'home' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${event.team === 'home' ? '' : ''}`}>
                            <span className="text-base">{getEventIcon(event.type)}</span>
                          </div>
                          <div className={`flex-1 ${event.team === 'home' ? 'text-left' : 'text-right'}`}>
                            {event.type === 'substitution' ? (
                              <div className="text-sm">
                                <div className="text-xs text-red-500">
                                  {event.player}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-gray-100">{event.player}</div>
                                <div className="text-xs text-gray-400 capitalize">
                                  {event.type.replace('_', ' ')}
                                </div>
                              </>
                            )}
                            {event.assist && (
                              <div className="text-xs text-green-500 mt-0.5">{event.assist}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`absolute ${event.team === 'home' ? 'left-4' : 'right-4'} text-sm font-medium text-gray-300`}>
                        {event.minute}'
                      </div>
                    </div>
                  ))}

                {/* Half Time Marker */}
                {match.score?.halftime && (
                  <div className="relative py-3 px-4 bg-[#0a0a0a] flex justify-center items-center">
                    <div className="bg-[#1e1e1e] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border border-[#333] text-gray-200">
                      HT {match.score.halftime.home ?? 0} - {match.score.halftime.away ?? 0}
                    </div>
                  </div>
                )}

                

                {/* Second Half Events */}
                {events
                  .filter(event => event.minute > 45) // Filter second half events
                  .map((event, index) => (
                    <div 
                      key={`second-half-${index}`} 
                      className={`relative flex items-center ${event.team === 'home' ? 'bg-[#121212]' : 'bg-[#0a0a0a]'} hover:bg-opacity-90 transition-colors`}
                    >
                      <div className={`flex-1 py-3 ${event.team === 'home' ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}>
                        <div className={`flex items-center gap-3 ${event.team === 'home' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${event.team === 'home' ? '' : ''}`}>
                            <span className="text-base">{getEventIcon(event.type)}</span>
                          </div>
                          <div className={`flex-1 ${event.team === 'home' ? 'text-left' : 'text-right'}`}>
                            {event.type === 'substitution' ? (
                              <div className="text-sm">
                                <div className="text-xs text-red-500">
                                  {event.player}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-gray-100">{event.player}</div>
                                <div className="text-xs text-gray-400 capitalize">
                                  {event.type.replace('_', ' ')}
                                </div>
                              </>
                            )}
                            {event.assist && (
                              <div className="text-sm text-green-600 mt-0.5">{event.assist}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`absolute ${event.team === 'home' ? 'left-4' : 'right-4'} text-sm font-medium text-gray-300`}>
                        {event.minute}'
                      </div>
                    </div>
                  ))}

                {/* Full Time Marker */}
                {match.status === 'FT' && match.score?.fulltime && (
                  <div className="relative py-3 px-4 bg-[#0a0a0a] flex justify-center items-center">
                    <div className="bg-[#1e1e1e] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border border-[#333] text-gray-200">
                      FT {match.score.fulltime.home ?? 0} - {match.score.fulltime.away ?? 0}
                    </div>
                  </div>
                )}
              </div>
              
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No match events available</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Match Statistics</h3>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : statistics.length > 0 ? (
              <div className="space-y-4">
                {statistics.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stat.home}</span>
                      <span className="font-medium">{stat.label}</span>
                      <span>{stat.away}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full ml-auto transition-all"
                          style={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No statistics available</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="lineups" className="space-y-6">
          {lineupsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((j) => (
                      <div key={j} className="flex items-center gap-3 p-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : lineups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {lineups.map((lineup) => (
                <Card key={lineup.teamId} className="p-3 md:p-4">
                  <div className="flex items-start gap-2 mb-3 md:mb-4">
                    {lineup.teamLogo && (
                      <img 
                        src={lineup.teamLogo} 
                        alt="" 
                        className="w-6 h-6 md:w-8 md:h-8 object-contain mt-0.5"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base md:text-lg leading-tight line-clamp-1">{lineup.teamName}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Formation: {lineup.formation}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {lineup.startingXI.map((player) => (
                      <div 
                        key={player.id} 
                        className="flex items-center gap-2 p-1.5 hover:bg-muted/30 rounded-md transition-colors text-sm"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-xs">
                          {player.number}
                        </div>
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <span className="font-medium truncate text-xs sm:text-sm">
                            {player.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase flex-shrink-0 hidden xs:inline">
                            {player.position.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Manager:</span> {lineup.coach.name}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No lineup data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="commentary" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Live Commentary</h3>
            <div className="text-center text-muted-foreground">
              <p>Live commentary feature coming soon</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-20 px-2 sm:px-6">
        <div className="bg-gradient-to-br from-muted/60 to-black/40 rounded-lg p-4 sm:p-5 border border-[#222]">
          <div className="space-y-3.5">
            {/* League Name */}
            {match.league && (
              <div className="flex items-center gap-3">
                {match.league.logo ? (
                  <img 
                    src={match.league.logo} 
                    alt={match.league.name} 
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                ) : (
                  <Trophy className="w-4 h-4 text-[#464646] flex-shrink-0" />
                )}
                <span className="text-sm text-gray-200">{match.league.name}</span>
              </div>
            )}

            {/* League Round */}
            {match.round && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#464646]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300">{match.round}</span>
              </div>
            )}

            {/* Venue */}
            {match.venue?.name && (
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#464646] flex-shrink-0" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.762 8.936h3.423l-1.308-3.524-.2-.4A2.6 2.6 0 0 0 13.561 3.7H8.426A2.586 2.586 0 0 0 6.11 5.311L4.7 8.936h3.524a2.967 2.967 0 0 1 2.819-1.712 2.923 2.923 0 0 1 2.719 1.712z" fill="currentColor"/>
                  <path d="M21.447 8.156l-2.819-6.142-.3-.5A3.588 3.588 0 0 0 15.3 0H6.646a3.725 3.725 0 0 0-3.223 1.913L.7 7.753a6.346 6.346 0 0 0-.7 3.021v4.833a4.834 4.834 0 0 0 4.833 4.833h12.385a4.834 4.834 0 0 0 4.833-4.833v-4.733a6.307 6.307 0 0 0-.604-2.718zm-1.41 3.121v.4A2.739 2.739 0 0 1 17.52 14.4a4.517 4.517 0 0 0 .5-1.913v-.6a2.788 2.788 0 0 0-.1-.906H13.9a2.967 2.967 0 0 1-2.819 1.712 3.072 3.072 0 0 1-2.819-1.712H4.128c0 .3-.1.6-.1.906v.6a4.165 4.165 0 0 0 .5 1.913 2.739 2.739 0 0 1-2.514-2.72v-.906a5.892 5.892 0 0 1 .5-2.215l2.722-5.74a1.607 1.607 0 0 1 1.41-.806H15.3a2 2 0 0 1 1.309.6l3.021 6.444a3.949 3.949 0 0 1 .4 1.812z" fill="currentColor"/>
                </svg>
                <span className="text-sm text-gray-300">{match.venue.name}</span>
              </div>
            )}

            {/* Date and Time */}
            {match.date && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#464646] flex-shrink-0" />
                  <span className="text-sm text-gray-200">
                    {new Date(match.date).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#464646] flex-shrink-0" />
                  <span className="text-sm text-gray-200">
                    {new Date(match.date).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
