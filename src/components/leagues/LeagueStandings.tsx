import { useQuery } from '@tanstack/react-query';
import { fetchLeagueStandings } from '@/lib/api-sports';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Trophy, ArrowDownToLine, ArrowUpToLine, Play } from 'lucide-react';
import { TeamLogo } from '@/components/matches/TeamLogo';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type StandingItem = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  description?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
  };
  group?: string;
};

type StandingsData = {
  [group: string]: StandingItem[];
};

interface LeagueStandingsProps {
  leagueId: number | string;
  season?: number;
  showTabs?: boolean;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

interface StandingsSkeletonProps {
  limit?: number;
}

const CURRENT_SEASON = new Date().getFullYear(); // Update this based on the current season

const StandingsSkeleton = ({ limit = 10 }: StandingsSkeletonProps) => (
  <div className="space-y-2">
    {Array(limit).fill(0).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-md" />
    ))}
  </div>
);

const StandingsError = () => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      Failed to load league standings. Please try again later.
    </AlertDescription>
  </Alert>
);

export const LeagueStandings = ({ 
  leagueId, 
  season = CURRENT_SEASON, 
  showTabs = true, 
  limit,
  showViewAll = false,
  onViewAll
}: LeagueStandingsProps) => {
  const { data: standings, isLoading, isError } = useQuery<StandingsData>({
    queryKey: ['leagueStandings', leagueId, season],
    queryFn: async () => {
      try {
        const numericLeagueId = typeof leagueId === 'string' ? parseInt(leagueId, 10) : leagueId;
        if (isNaN(numericLeagueId)) {
          throw new Error('Invalid league ID');
        }
        return await fetchLeagueStandings(numericLeagueId, season);
      } catch (error) {
        // Error fetching standings
        throw error;
      }
    },
    enabled: !!leagueId && !isNaN(typeof leagueId === 'string' ? parseInt(leagueId, 10) : leagueId),
  });

  const getShortDescription = (description: string) => {
    if (description.includes('Champions League')) return 'UCL';
    if (description.includes('Europa League')) return 'UEL';
    if (description.includes('Conference League')) return 'UECL';
    if (description.includes('Promotion')) return 'Promo';
    if (description.includes('Relegation')) return 'Rel';
    return description.split(' ')[0]; // Return first word for other cases
  };

  const renderStandingsTable = (standingsData: StandingItem[], groupName?: string) => {
    // Apply limit if provided
    const displayStandings = limit ? standingsData.slice(0, limit) : standingsData;

    // Mobile View - Condensed
    const mobileView = (
      <div className="md:hidden ">
        <div className="border-b border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left pl-1 py-1 w-5 text-[9px]">#</th>
                  <th className="text-left py-1 pl-0.5 pr-1 min-w-0 text-[9px]">
                    <div className="w-[100px] sm:w-[140px] truncate">Team</div>
                  </th>
                  <th className="text-center py-1 w-6 text-[9px]">P</th>
                  <th className="text-center py-1 w-6 text-[9px]">GD</th>
                  <th className="text-center py-1 w-8 font-bold text-[9px]">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayStandings.map((team) => (
                  <tr key={`mobile-${team.team.id}-${team.rank}`} className="hover:bg-muted/20">
                    <td className="py-1 pl-1 text-[10px] text-center">{team.rank}</td>
                    <td className="py-1">
                      <Link to={`/teams/${team.team.id}`} className="flex items-center gap-0.5">
                        <TeamLogo teamName={team.team.name} logoUrl={team.team.logo} className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-medium truncate w-full">{team.team.name}</span>
                          {team.description && (
                            <span className={cn(
                              'flex items-center gap-0.5 text-[9px] leading-none',
                              team.description.toLowerCase().includes('champions league') ? 'text-blue-500' :
                              team.description.toLowerCase().includes('europa') ? 'text-purple-500' :
                              team.description.toLowerCase().includes('conference') ? 'text-green-600' :
                              team.description.toLowerCase().includes('relegation') ? 'text-red-500' :
                              'text-muted-foreground'
                            )}>
                              {team.description.includes('Promotion') ? (
                                <ArrowUpToLine className="h-2 w-2 text-green-500 flex-shrink-0" />
                              ) : team.description.includes('Relegation') ? (
                                <ArrowDownToLine className="h-2 w-2 text-red-500 flex-shrink-0" />
                              ) : team.description.includes('Champions League') ? (
                                <Trophy className="h-2 w-2 text-blue-500 flex-shrink-0" />
                              ) : team.description.includes('Europa League') ? (
                                <Trophy className="h-2 w-2 text-purple-500 flex-shrink-0" />
                              ) : team.description.includes('Conference League') ? (
                                <Trophy className="h-2 w-2 text-green-600 flex-shrink-0" />
                              ) : (
                                <Play className="h-2 w-2 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="truncate">{getShortDescription(team.description)}</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="text-center text-xs">{team.all.played}</td>
                    <td className="text-center text-xs">{team.goalsDiff}</td>
                    <td className="text-center font-bold text-xs">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    // Desktop View - Full
    const desktopView = (
      <div className="hidden md:block">
        <div className="relative overflow-x-auto rounded-sm border border-border">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-8 px-1.5 py-1.5 sm:px-2 sm:py-2 text-center text-xs">#</TableHead>
                <TableHead className="px-1.5 py-1.5 sm:px-2 sm:py-2 min-w-[120px] sm:min-w-auto text-xs">Team</TableHead>
                <TableHead className="w-8 px-1 py-1.5 sm:px-2 sm:py-2 text-center text-xs">MP</TableHead>
                <TableHead className="w-8 px-1 py-1.5 sm:px-2 sm:py-2 text-center text-xs">W</TableHead>
                <TableHead className="w-8 px-1 py-1.5 sm:px-2 sm:py-2 text-center text-xs">D</TableHead>
                <TableHead className="w-8 px-1 py-1.5 sm:px-2 sm:py-2 text-center text-xs">L</TableHead>
                <TableHead className="w-8 px-1 py-1.5 sm:px-2 sm:py-2 text-center text-xs">GD</TableHead>
                <TableHead className="w-10 px-1.5 py-1.5 sm:px-2 sm:py-2 text-center font-bold text-xs">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStandings.map((team) => (
                <TableRow 
                  key={`desktop-${team.team.id}-${team.rank}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-center text-xs">
                    {team.rank}
                  </TableCell>
                  <TableCell className="px-1.5 py-1.5 sm:px-2 sm:py-2">
                    <Link 
                      to={`/teams/${team.team.id}`}
                      className="flex items-center gap-1.5 group min-w-0"
                    >
                      <TeamLogo 
                        teamName={team.team.name} 
                        logoUrl={team.team.logo} 
                        className="w-5 h-5 flex-shrink-0" 
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm sm:text-base group-hover:underline truncate">
                          {team.team.name}
                        </span>
                        {team.description && (
                          <span className={cn(
                            'text-xs truncate mt-0.5',
                            team.description.toLowerCase().includes('champions league') ? 'text-blue-500' :
                            team.description.toLowerCase().includes('europa') ? 'text-purple-500' :
                            team.description.toLowerCase().includes('conference') ? 'text-green-600' :
                            team.description.toLowerCase().includes('relegation') ? 'text-red-500' :
                            'text-muted-foreground'
                          )}>
                            {team.description.includes('Promotion') ? (
                              <span className="flex items-center gap-1">
                                <ArrowUpToLine className="h-3 w-3" /> {team.description}
                              </span>
                            ) : team.description.includes('Relegation') ? (
                              <span className="flex items-center gap-1">
                                <ArrowDownToLine className="h-3 w-3" /> {team.description}
                              </span>
                            ) : team.description.includes('Champions League') ? (
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-blue-500" /> {team.description}
                              </span>
                            ) : team.description.includes('Europa League') ? (
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-purple-500" /> {team.description}
                              </span>
                            ) : team.description.includes('Conference League') ? (
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-green-600" /> {team.description}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" /> {team.description}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-1 py-2 sm:px-3 sm:py-3 text-center text-sm">
                    {team.all.played}
                  </TableCell>
                  <TableCell className="px-1 py-2 sm:px-2 sm:py-3 text-center text-sm">
                    {team.all.win}
                  </TableCell>
                  <TableCell className="px-1 py-2 sm:px-2 sm:py-3 text-center text-sm">
                    {team.all.draw}
                  </TableCell>
                  <TableCell className="px-1 py-2 sm:px-2 sm:py-3 text-center text-sm">
                    {team.all.lose}
                  </TableCell>
                  <TableCell className="px-1 py-2 sm:px-2 sm:py-3 text-center text-sm">
                    {team.goalsDiff}
                  </TableCell>
                  <TableCell className="px-2 py-2 sm:px-3 sm:py-3 text-center font-bold text-sm sm:text-base">
                    {team.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );

    return (
      <div className="space-y-2">
        {mobileView}
        {desktopView}
        {showViewAll && limit && standingsData.length > limit && onViewAll && (
          <div className="flex justify-center mt-2">
            <button 
              onClick={onViewAll}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 px-2 py-1"
            >
              View All Standings
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <StandingsSkeleton limit={limit} />;
  if (isError) return <StandingsError />;

  if (!standings || Object.keys(standings).length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Standings Available</AlertTitle>
        <AlertDescription>
          There are no standings available for this league at the moment.
        </AlertDescription>
      </Alert>
    );
  }

  const groups = Object.entries(standings);
  
  // If there's only one group and showTabs is false, just show the table
  if (groups.length === 1 || !showTabs) {
    return renderStandingsTable(groups[0][1]);
  }

  // Show tabs for multiple groups
  return (
    <Tabs defaultValue={groups[0][0]} className="w-full">
      <div className="relative">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="w-max min-w-full bg-transparent p-0 gap-1">
            {groups.map(([groupName]) => (
              <TabsTrigger 
                key={groupName} 
                value={groupName}
                className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {groupName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      
      <div className="mt-4">
        {groups.map(([groupName, groupStandings]) => (
          <TabsContent key={groupName} value={groupName} className="mt-0">
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="bg-muted/30 p-3 border-b">
                <h3 className="font-semibold text-center text-sm sm:text-base">{groupName}</h3>
              </div>
              {renderStandingsTable(groupStandings, groupName)}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};
