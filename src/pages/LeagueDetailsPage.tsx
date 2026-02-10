import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { CalendarDays, Clock, Trophy, Users, Star, ChevronDown, BarChart2, ArrowLeft, Info, ListChecks, Newspaper, Archive } from 'lucide-react';
import MetaTags from '@/components/MetaTags';
import { shortenTeamName } from '@/utils/teamNameUtils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { getLeaguesByCountry } from '@/services/leagueService';
import { footballApi, CACHE_DURATION } from '@/services/footballApi';
import { assets } from '@/assets/images';

// ... interfaces ...

const LeagueDetailsPage = () => {
  const navigate = useNavigate();
  const { country, leagueName } = useParams<{ country: string; leagueName: string }>();
  const isMobile = useIsMobile();
  const [league, setLeague] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableView, setTableView] = useState<'full' | 'short' | 'form'>('full');
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchLeague = async () => {
      if (!country || !leagueName) {
        setError('No league information provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch all leagues for the country
        const leagues = await getLeaguesByCountry(country);
        
        // Find the matching league
        // We compare normalized names to ensure a match
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetName = normalize(leagueName);

        const foundLeague = leagues.find(l => 
          normalize(l.name) === targetName || 
          l.name.toLowerCase().includes(leagueName.toLowerCase().replace(/-/g, ' '))
        );

        if (foundLeague) {
          setLeague(foundLeague);
          setSelectedSeason(foundLeague.season);
        } else {
          console.error(`League not found: ${leagueName} in ${country}`);
          setError('League not found');
        }

      } catch (err) {
        console.error('Error fetching league:', err);
        setError('Failed to load league data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeague();
  }, [country, leagueName]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch Standings
  const {
    data: standingsResponse,
    isLoading: isLoadingStandings,
    error: standingsError
  } = useQuery({
    queryKey: ['league-standings', league?.id, selectedSeason],
    queryFn: async () => {
      if (!league?.id) return [];
      const data = await footballApi.getLeagueStandings(league.id, selectedSeason);
      return data.response;
    },
    enabled: !!league?.id,
    staleTime: CACHE_DURATION.STANDINGS,
  });

  const standings = Array.isArray(standingsResponse) ? standingsResponse : [];

  // Filter standings based on table view
  const getDisplayedStandings = () => {
    if (tableView === 'short') {
      const top6 = standings.slice(0, 6);
      const bottom3 = standings.slice(-3);
      return [...top6, ...bottom3];
    }
    return standings;
  };

  const displayedStandings = getDisplayedStandings();

  // Fetch Fixtures & Results
  const {
    data: fixturesData,
    isLoading: isLoadingFixtures
  } = useQuery({
    queryKey: ['league-fixtures', league?.id, selectedSeason],
    queryFn: async () => {
      if (!league?.id) return { upcoming: [], results: [] };

      const allFixtures = await footballApi.getFixturesByLeague(league.id, selectedSeason);

      const upcoming = allFixtures.filter(f =>
        ['NS', 'TBD', 'SUSP', 'PST', 'CANC', 'ABD'].includes(f.fixture.status.short)
      ).sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());

      const results = allFixtures.filter(f =>
        ['FT', 'AET', 'PEN', '1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(f.fixture.status.short)
      ).sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

      return { upcoming, results };
    },
    enabled: !!league?.id,
    staleTime: CACHE_DURATION.FIXTURES
  });

  const upcomingFixtures = fixturesData?.upcoming || [];
  const completedMatches = fixturesData?.results || [];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center bg-amber-50 dark:bg-amber-900/10 p-8 rounded-xl border border-amber-200 dark:border-amber-800/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-3">
            {error || 'League Not Found'}
          </h2>
          <p className="text-amber-700 dark:text-amber-300 mb-6">
            {error || "The league you're looking for doesn't exist or may have been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/30">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-[#00141e] font-sans">
      <MetaTags
        title={`${league.name} - Fixtures, Standings & Results`}
        description={`Get the latest ${league.name} fixtures, live scores, standings and results.`}
        url={`/leagues/${country}/${leagueName}`}
      />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
            <Link to="/" className="hover:text-[#ff0046] transition-colors">Football</Link>
            <ChevronDown className="h-3 w-3 mx-2 -rotate-90" />
            <span className="flex items-center gap-1">
              {league.flag && (
                <img
                  src={league.flag}
                  alt={league.country}
                  className="w-4 h-3 object-cover rounded-[1px]"
                />
              )}
              {league.country}
            </span>
            <ChevronDown className="h-3 w-3 mx-2 -rotate-90" />
            <span className="text-[#00141e] font-bold">{league.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* League Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-center shadow-sm">
                <img
                  src={league.logo}
                  alt={`${league.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64';
                  }}
                />
              </div>

              {/* League Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#00141e] tracking-tight">
                    {league.name}
                  </h1>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isFollowing ? 'bg-blue-50' : ''}`}>
                      <Info className="w-4 h-4" /> {/* Using Pin icon if available would be better, using Info as placeholder or similar based on Lucide */}
                    </div>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                  <span>{selectedSeason}</span>
                </div>
              </div>
            </div>

            {/* Season Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold text-[#00141e] transition-colors">
                  {selectedSeason}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-12 overflow-x-auto scrollbar-hide border-b border-transparent">
            {/* Creating custom tabs navigation to match design */}
            {[
              { id: 'overview', label: 'SUMMARY' },
              { id: 'results', label: 'RESULTS' },
              { id: 'fixtures', label: 'FIXTURES' },
              { id: 'standings', label: 'STANDINGS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-bold py-3 px-2 border-b-[3px] transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'text-[#ff0046] border-[#ff0046]'
                  : 'text-gray-500 border-transparent hover:text-[#00141e]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 pt-0 pb-8">
        {/* Navigation tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >


          {/* Tab content */}

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 py-6">

              {/* Upcoming */}


              {/* Scheduled Matches Section */}
              {upcomingFixtures.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#00141e] font-bold text-lg flex items-center gap-2">
                      Scheduled
                    </h2>
                    <Button variant="link" className="text-[#ff0046] text-xs font-bold p-0 h-auto" onClick={() => setActiveTab('fixtures')}>
                      View All Fixtures
                    </Button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {upcomingFixtures.slice(0, 5).map((fixture: any) => (
                      <div key={fixture.fixture.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/match/${fixture.fixture.id}`)}>
                        <div className="w-16 text-gray-400 text-xs flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-500">{format(parseISO(fixture.fixture.date), 'dd/MM')}</span>
                            <span className="text-[10px]">{format(parseISO(fixture.fixture.date), 'HH:mm')}</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 sm:flex-row sm:gap-8 sm:items-center px-4">
                          <div className="flex items-center gap-2 flex-1 sm:justify-end">
                            <span className="text-sm font-medium text-[#00141e] text-right truncate">{shortenTeamName(fixture.teams.home.name, isMobile)}</span>
                            {fixture.teams.home.logo && <img src={fixture.teams.home.logo} alt="" className="w-5 h-5 object-contain" />}
                          </div>
                          <div className="text-xs font-bold text-gray-400 text-center min-w-[24px] bg-gray-100 rounded px-1 py-0.5">VS</div>
                          <div className="flex items-center gap-2 flex-1">
                            {fixture.teams.away.logo && <img src={fixture.teams.away.logo} alt="" className="w-5 h-5 object-contain" />}
                            <span className="text-sm font-medium text-[#00141e] truncate">{shortenTeamName(fixture.teams.away.name, isMobile)}</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest Scores Section */}
              {completedMatches.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#00141e] font-bold text-lg">Latest Scores</h2>
                    <Button variant="link" className="text-[#ff0046] text-xs font-bold p-0 h-auto" onClick={() => setActiveTab('results')}>
                      View All Results
                    </Button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {completedMatches.slice(0, 5).map((fixture: any) => (
                      <div key={fixture.fixture.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/match/${fixture.fixture.id}`)}>
                        <div className="w-16 text-gray-400 text-xs flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-500">{format(parseISO(fixture.fixture.date), 'dd/MM')}</span>
                            <span className="text-[#ff0046] font-bold text-[10px]">FT</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 sm:flex-row sm:gap-8 sm:items-center px-4">
                          <div className="flex items-center gap-2 flex-1 sm:justify-end">
                            <span className={`text-sm truncate text-right ${fixture.teams.home.winner ? 'text-[#00141e] font-bold' : 'text-gray-600'}`}>
                              {shortenTeamName(fixture.teams.home.name, isMobile)}
                            </span>
                            {fixture.teams.home.logo && <img src={fixture.teams.home.logo} alt="" className="w-5 h-5 object-contain" />}
                          </div>
                          <div className="flex gap-4 text-sm font-bold text-[#00141e] min-w-[40px] justify-center bg-gray-100 rounded px-2 py-1">
                            <span>{fixture.goals.home}</span>
                            <span>-</span>
                            <span>{fixture.goals.away}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            {fixture.teams.away.logo && <img src={fixture.teams.away.logo} alt="" className="w-5 h-5 object-contain" />}
                            <span className={`text-sm truncate ${fixture.teams.away.winner ? 'text-[#00141e] font-bold' : 'text-gray-600'}`}>
                              {shortenTeamName(fixture.teams.away.name, isMobile)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Standings Preview */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#00141e] font-bold text-lg">Table</h2>
                  <Button variant="link" className="text-[#ff0046] text-xs font-bold p-0 h-auto" onClick={() => setActiveTab('standings')}>
                    View Full Table
                  </Button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="py-2 w-10 text-center">#</th>
                        <th className="py-2 text-left">Team</th>
                        <th className="py-2 w-10 text-center">P</th>
                        <th className="py-2 w-10 text-center">GD</th>
                        <th className="py-2 w-10 text-center">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedStandings.slice(0, 5).map((team: any) => (
                        <tr key={team.team.id} className="border-b border-gray-100">
                          <td className="py-2 text-center font-bold">{team.rank}</td>
                          <td className="py-2 flex items-center gap-2">
                            {team.team.logo && <img src={team.team.logo} className="w-4 h-4" alt="" />}
                            <span className="font-medium">{team.team.name}</span>
                          </td>
                          <td className="py-2 text-center text-gray-500">{team.all.played}</td>
                          <td className="py-2 text-center text-gray-500">{team.goalsDiff}</td>
                          <td className="py-2 text-center font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          )}

          {/* Standings tab */}
          <TabsContent value="standings">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-[#00141e]">League Table</h3>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                  {[
                    { id: 'full', label: 'Full' },
                    { id: 'short', label: 'Short' },
                    { id: 'form', label: 'Form' }
                  ].map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setTableView(view.id as 'full' | 'short' | 'form')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${tableView === view.id
                        ? 'bg-[#ff0046] text-white'
                        : 'text-gray-500 hover:text-[#00141e] hover:bg-gray-50'
                        }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                if (isLoadingStandings) {
                  return (
                    <div className="space-y-3 p-6">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full bg-gray-50" />
                      ))}
                    </div>
                  );
                }

                if (standingsError || !standings?.length) {
                  return (
                    <div className="p-8 text-center">
                      <div className="mb-4">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-[#00141e] mb-2">No Standings Available</h3>
                        <p className="text-gray-500 text-sm">
                          {standingsError
                            ? 'Failed to load standings. Please try again later.'
                            : `No standings data available for the ${selectedSeason} season.`}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Render table (reusing the same structure as in Overview but full width)
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-100">
                          <th className="py-3 pl-4 w-10 text-center">#</th>
                          <th className="py-3 text-left">TEAM</th>
                          <th className="py-3 text-center w-10">MP</th>
                          <th className="py-3 text-center w-10">W</th>
                          <th className="py-3 text-center w-10">D</th>
                          <th className="py-3 text-center w-10">L</th>
                          <th className="py-3 text-center w-10">G</th>
                          <th className="py-3 text-center w-10">GD</th>
                          <th className="py-3 text-center w-10 font-black text-[#00141e]">PTS</th>
                          <th className="py-3 pr-4 text-center w-32">FORM</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {displayedStandings.map((team: any, i: number) => (
                          <tr key={team.team.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                            <td className="py-2 pl-4 text-center">
                              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${team.rank <= 4 ? 'bg-[#003e87]' : team.rank === 5 ? 'bg-[#b33916]' : team.rank >= standings.length - 3 ? 'bg-[#cc0000]' : 'bg-gray-400'
                                }`}>
                                {team.rank}.
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-3">
                                <img src={team.team.logo} alt="" className="w-6 h-6 object-contain" />
                                <span className="font-bold text-[#00141e]">{team.team.name}</span>
                              </div>
                            </td>
                            <td className="py-2 text-center text-[#00141e]">{team.all.played}</td>
                            <td className="py-2 text-center text-[#00141e]">{team.all.win}</td>
                            <td className="py-2 text-center text-[#00141e]">{team.all.draw}</td>
                            <td className="py-2 text-center text-[#00141e]">{team.all.lose}</td>
                            <td className="py-2 text-center text-[#00141e]">{team.all.goals.for}:{team.all.goals.against}</td>
                            <td className="py-2 text-center text-[#00141e]">{team.goalsDiff}</td>
                            <td className="py-2 text-center font-black text-[#00141e]">{team.points}</td>
                            <td className="py-2 pr-4">
                              <div className="flex items-center justify-end gap-1">
                                {team.form?.split('').map((result: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${result === 'W' ? 'bg-[#00b246]' :
                                      result === 'D' ? 'bg-[#f5a623]' :
                                        result === 'L' ? 'bg-[#ff0046]' : 'bg-gray-300'
                                      }`}
                                  >
                                    {result}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* Promotion/Relegation Key */}
              <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#003e87]"></div>
                  <span className="text-[11px] text-[#00141e]">Promotion - UEFA Champions League (League phase)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#b33916]"></div>
                  <span className="text-[11px] text-[#00141e]">Promotion - Europa League (League phase)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#cc0000]"></div>
                  <span className="text-[11px] text-[#00141e]">Relegation - 2. Bundesliga</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Results tab */}
          <TabsContent value="results">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-[#ff0046] shadow-sm">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00141e]">Recent Results</h3>
                    <p className="text-sm text-gray-500 font-medium">{completedMatches.length} matches completed</p>
                  </div>
                </div>
              </div>

              {(() => {
                if (isLoadingFixtures) {
                  return (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full bg-gray-50" />
                      ))}
                    </div>
                  );
                }

                if (!completedMatches?.length) {
                  return (
                    <div className="p-8 text-center">
                      <div className="mb-4">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-[#00141e] mb-2">No Results Available</h3>
                        <p className="text-gray-500 text-sm">
                          No completed matches found for {league.name} in the {selectedSeason} season.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-gray-100">
                    {completedMatches.map((fixture: any) => (
                      <div key={fixture.fixture.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => navigate(`/match/${fixture.fixture.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8 flex-1">
                            {/* Date Box */}
                            <div className="w-24 text-center hidden sm:block">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-gray-500">{format(parseISO(fixture.fixture.date), 'dd.MM')}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{format(parseISO(fixture.fixture.date), 'yyyy')}</span>
                              </div>
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 font-bold w-12">
                              {format(parseISO(fixture.fixture.date), 'dd/MM')}
                            </div>

                            {/* Home Team */}
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className={`text-[#00141e] text-sm md:text-base truncate ${fixture.teams.home.winner ? 'font-bold' : 'font-medium'}`}>
                                {shortenTeamName(fixture.teams.home.name, isMobile)}
                              </span>
                              {fixture.teams.home.logo && (
                                <img src={fixture.teams.home.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                              )}
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-center min-w-[60px]">
                              <div className="text-lg sm:text-xl font-black text-[#00141e] bg-gray-100 px-3 py-1 rounded-md">
                                {fixture.goals.home} - {fixture.goals.away}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                                {fixture.fixture.status.short}
                              </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-3 flex-1">
                              {fixture.teams.away.logo && (
                                <img src={fixture.teams.away.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                              )}
                              <span className={`text-[#00141e] text-sm md:text-base truncate ${fixture.teams.away.winner ? 'font-bold' : 'font-medium'}`}>
                                {shortenTeamName(fixture.teams.away.name, isMobile)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* Fixtures tab */}
          <TabsContent value="fixtures" className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-[#ff0046] shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00141e]">Upcoming Fixtures</h3>
                    <p className="text-sm text-gray-500 font-medium">{upcomingFixtures.length} matches scheduled</p>
                  </div>
                </div>
              </div>

              {(() => {
                if (isLoadingFixtures) {
                  return (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full bg-gray-50" />
                      ))}
                    </div>
                  );
                }

                if (!upcomingFixtures?.length) {
                  return (
                    <div className="p-8 text-center">
                      <div className="mb-4">
                        <CalendarDays className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-[#00141e] mb-2">No Upcoming Fixtures</h3>
                        <p className="text-gray-500 text-sm">
                          No upcoming fixtures found for {league.name} in the {selectedSeason} season.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-gray-100">
                    {upcomingFixtures.map((fixture: any) => (
                      <div key={fixture.fixture.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => navigate(`/match/${fixture.fixture.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8 flex-1">
                            {/* Date Box */}
                            <div className="w-24 text-center hidden sm:block">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-[#00141e]">{format(parseISO(fixture.fixture.date), 'HH:mm')}</span>
                                <span className="text-[10px] text-gray-500 font-medium">{format(parseISO(fixture.fixture.date), 'dd.MM')}</span>
                              </div>
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 font-bold w-12 flex flex-col items-center">
                              <span>{format(parseISO(fixture.fixture.date), 'dd/MM')}</span>
                              <span className="font-normal">{format(parseISO(fixture.fixture.date), 'HH:mm')}</span>
                            </div>

                            {/* Home Team */}
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className="text-[#00141e] font-bold text-sm md:text-base truncate">
                                {shortenTeamName(fixture.teams.home.name, isMobile)}
                              </span>
                              {fixture.teams.home.logo && (
                                <img src={fixture.teams.home.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                              )}
                            </div>

                            {/* VS */}
                            <div className="flex flex-col items-center min-w-[60px]">
                              <div className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                VS
                              </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-3 flex-1">
                              {fixture.teams.away.logo && (
                                <img src={fixture.teams.away.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                              )}
                              <span className="text-[#00141e] font-bold text-sm md:text-base truncate">
                                {shortenTeamName(fixture.teams.away.name, isMobile)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeagueDetailsPage;
