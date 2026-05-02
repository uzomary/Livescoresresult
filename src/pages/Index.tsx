import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MatchCard } from "@/components/matches/MatchCard";
import { ModernMatchCard } from "@/components/matches/ModernMatchCard";
import { CompactMatchCard } from "@/components/matches/CompactMatchCard";
import { FilterTabs } from "@/components/FilterTabs";
import { DateNavigation } from "@/components/DateNavigation";
import MatchDetails from "@/components/MatchDetails";
import SlidingCalendar from "@/components/SlidingCalendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { footballApi } from "@/services/footballApi";
import { multiSportApi, SportType } from "@/services/multiSportApi";
import { transformFixtures, Match } from "@/utils/fixtureTransform";
import { Calendar, Trophy, Heart, Filter, ChevronRight, ChevronDown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PlayerSearch } from "@/components/PlayerSearch";
import { PlayerProfile } from "@/components/PlayerProfile";
import { LeagueStandings } from "@/components/LeagueStandings";
import { useSearch, useLayout } from "@/layouts/MainLayout";
import { useMatchNavigation } from "@/hooks/useMatchNavigation";
import MetaTags from "@/components/MetaTags";
import { createMatchUrl } from "@/utils/routing";
import { TopNavigation } from "@/components/TopNavigation";
import { SportTabs, SportId } from "@/components/SportTabs";
import { favoritesService } from "@/services/favoritesService";
import { leaguePriorityService } from "@/services/leaguePriorityService";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "match" | "player" | "standings">("home");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all");
  const [activeSport, setActiveSport] = useState<SportId>('football');
  const isFootball = activeSport === 'football';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLeagueForStandings, setSelectedLeagueForStandings] = useState<string | null>(null);
  const [collapsedLeagues, setCollapsedLeagues] = useState<Set<string>>(new Set());
  const [pinnedLeagues, setPinnedLeagues] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('livescore_pinned_leagues');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const { searchQuery } = useSearch();
  const { setTopContent } = useLayout();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(favoritesService.getFavorites());
  const matchCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();
  const { navigateToMatch } = useMatchNavigation();

  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      setFavoriteIds(favoritesService.getFavorites());
    };
    window.addEventListener('favorites-updated', handleFavoritesUpdate);
    return () => window.removeEventListener('favorites-updated', handleFavoritesUpdate);
  }, []);

  // Fetch custom league priorities
  const [customPriorities, setCustomPriorities] = useState<Record<string, number>>({});
  useEffect(() => {
    const fetchPriorities = async () => {
      const priorities = await leaguePriorityService.getAll();
      setCustomPriorities(priorities);
    };
    fetchPriorities();
  }, []);

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // Football fixtures query (only runs when football is selected)
  const { data: fixturesData, isLoading: isLoadingFootball, error: errorFootball } = useQuery({
    queryKey: ['fixtures', formattedDate],
    queryFn: () => footballApi.getFixturesByDate(formattedDate),
    enabled: isFootball,
    // Intelligent refetch based on match status - REAL-TIME for live matches
    refetchInterval: (query) => {
      if (!isFootball) return false;
      if (!query.state.data?.response) return false; // No data, don't refetch

      const hasLiveMatches = query.state.data.response.some((fixture: any) =>
        ['1H', '2H', 'HT', 'LIVE', 'ET', 'P', 'PENALTY'].includes(fixture.fixture?.status?.short)
      );

      // If there are live matches, refetch every 10 seconds for real-time updates
      // If no live matches, refetch every 5 minutes
      return hasLiveMatches ? 10000 : 300000;
    },
    refetchIntervalInBackground: false, // Stop refetching when tab is inactive
    refetchOnWindowFocus: true, // Refetch when switching back to tab for immediate updates
    staleTime: (query) => {
      // Dynamic staleTime based on live matches
      if (!query.state.data?.response) return 5 * 60 * 1000;

      const hasLiveMatches = query.state.data.response.some((fixture: any) =>
        ['1H', '2H', 'HT', 'LIVE', 'ET', 'P', 'PENALTY'].includes(fixture.fixture?.status?.short)
      );

      // Live matches: 0ms staleTime (always fresh, no cache)
      // Non-live matches: 30 minutes cache
      return hasLiveMatches ? 0 : 30 * 60 * 1000;
    },
    retry: (failureCount, error: any) => {
      // Don't retry rate limit errors
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Background odds query — fires after fixtures are loaded, doesn't block match display
  const { data: oddsData } = useQuery({
    queryKey: ['odds', formattedDate],
    queryFn: () => footballApi.getOddsForFixtures(fixturesData!.response, formattedDate),
    enabled: isFootball && !!fixturesData?.response?.length,
    staleTime: 60 * 60 * 1000, // 1 hour cache for odds
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Background Live Red Cards query — only if football is active and we have live matches or it's today
  const isToday = formattedDate === new Date().toISOString().split('T')[0];
  const { data: liveRedCards } = useQuery({
    queryKey: ['live-red-cards'],
    queryFn: () => footballApi.getLiveRedCards(),
    enabled: isFootball && isToday,
    refetchInterval: 30000, // Sync every 30 seconds
    staleTime: 25000,
  });

  // Persist red cards to localStorage so they remain after match ends
  const [persistentRedCards, setPersistentRedCards] = useState<Record<string, { home: number; away: number }>>(() => {
    const stored = localStorage.getItem(`redcards_${formattedDate}`);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    if (liveRedCards && Object.keys(liveRedCards).length > 0) {
      setPersistentRedCards(prev => {
        const next = { ...prev };
        let changed = false;
        Object.entries(liveRedCards).forEach(([id, cards]) => {
          if (!prev[id] || prev[id].home !== cards.home || prev[id].away !== cards.away) {
            next[id] = cards;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(`redcards_${formattedDate}`, JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }
  }, [liveRedCards, formattedDate]);

  // Merge odds into fixtures when available
  const fixturesWithOdds = useMemo(() => {
    if (!fixturesData) return null;

    return {
      ...fixturesData,
      response: fixturesData.response.map((fixture: any) => ({
        ...fixture,
        odds: oddsData?.[fixture.fixture.id] || fixture.odds
      }))
    };
  }, [fixturesData, oddsData]);

  // Multi-sport query (only runs when a non-football sport is selected)
  const { data: multiSportData, isLoading: isLoadingMultiSport, error: errorMultiSport } = useQuery({
    queryKey: ['multiSport', activeSport, formattedDate],
    queryFn: () => multiSportApi.getGamesByDate(activeSport as SportType, formattedDate),
    enabled: !isFootball,
    refetchInterval: (query) => {
      if (isFootball) return false;
      const data = query.state.data;
      if (!data || !Array.isArray(data)) return false;
      const hasLive = data.some((m: Match) => ['LIVE', '1H', '2H', 'HT'].includes(m.status));
      // Real-time updates: 15 seconds for live, 5 minutes for non-live
      return hasLive ? 15000 : 300000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true, // Refetch when switching back to tab
    staleTime: (query) => {
      const data = query.state.data;
      if (!data || !Array.isArray(data)) return 5 * 60 * 1000;
      const hasLive = data.some((m: Match) => ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(m.status));
      // Live matches: 0ms staleTime (no cache), Non-live: 10 minutes
      return hasLive ? 0 : 10 * 60 * 1000;
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('429')) return false;
      return failureCount < 2;
    },
  });

  // Unified loading/error/matches based on active sport
  const isLoading = activeSport === 'favorites' ? (isLoadingFootball || isLoadingMultiSport) : (isFootball ? isLoadingFootball : isLoadingMultiSport);
  const error = isFootball ? errorFootball : errorMultiSport;

  const matches: Match[] = useMemo(() => {
    let footballMatches = fixturesWithOdds ? transformFixtures(fixturesWithOdds.response) : [];

    // Apply persistent red cards (from sync or storage)
    if (persistentRedCards && Object.keys(persistentRedCards).length > 0) {
      footballMatches = footballMatches.map(m => {
        const rc = persistentRedCards[m.id];
        if (rc) {
          return {
            ...m,
            homeTeam: { ...m.homeTeam, redCards: rc.home || m.homeTeam.redCards },
            awayTeam: { ...m.awayTeam, redCards: rc.away || m.awayTeam.redCards }
          };
        }
        return m;
      });
    }

    if (activeSport === 'favorites') {
      const otherMatches = multiSportData || [];
      const allFetched = [...footballMatches, ...otherMatches];
      return allFetched.filter(m => favoriteIds.includes(m.id));
    }

    return isFootball
      ? footballMatches
      : (multiSportData || []);
  }, [activeSport, isFootball, fixturesWithOdds, multiSportData, favoriteIds, liveRedCards]);

  // Filter matches based on active filter tab and search query
  const filterAndSearchMatches = useCallback((matches: Match[]) => {
    const searchLower = searchQuery.trim().toLowerCase();

    return matches.filter(match => {
      // If we are in favorites tab, we already filtered for favorites in the matches useMemo
      // but we still want to apply the sub-filters (live, finished, etc.)

      // Apply filter tab logic
      if (activeFilterTab === 'live') {
        const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(match.status);
        if (!isLive) return false;
      } else if (activeFilterTab === 'finished') {
        const isFinished = ['FT', 'FINISHED', 'AET', 'PEN'].includes(match.status);
        if (!isFinished) return false;
      } else if (activeFilterTab === 'scheduled') {
        const isScheduled = match.status === 'SCHEDULED';
        if (!isScheduled) return false;
      }
      // 'all' shows everything

      // If search query exists, apply search filter
      if (searchLower) {
        const homeTeamMatch = match.homeTeam.name.toLowerCase().includes(searchLower);
        const awayTeamMatch = match.awayTeam.name.toLowerCase().includes(searchLower);
        const leagueNameMatch = (typeof match.league === 'string' ? match.league : match.league.name).toLowerCase().includes(searchLower);
        const countryMatch = (typeof match.league === 'object' && match.league.country?.toLowerCase().includes(searchLower)) || false;

        return homeTeamMatch || awayTeamMatch || leagueNameMatch || countryMatch;
      }

      return true;
    });
  }, [activeFilterTab, searchQuery]);

  const filteredMatches = useMemo(() =>
    filterAndSearchMatches(matches),
    [matches, filterAndSearchMatches]
  );

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const ongoingCount = matches.filter(match => ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(match.status)).length;
    const onTvCount = matches.filter(match => {
      const leagueName = typeof match.league === 'string' ? match.league : match.league?.name || '';
      return leagueName.includes('Premier League') || leagueName.includes('Champions League');
    }).length;

    return { ongoingCount, onTvCount };
  }, [matches]);

  // Group matches by league for better organization
  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};

    // Sort matches by time if "by-time" filter is active
    const matchesToGroup = activeFilterTab === 'by-time'
      ? [...filteredMatches].sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return timeA - timeB;
      })
      : filteredMatches;

    matchesToGroup.forEach(match => {
      let leagueName = typeof match.league === 'string' ? match.league : match.league?.name || 'Unknown League';

      // Create unique league names by combining league name with country
      const league = match.league;
      if (typeof league === 'object' && league?.country) {
        // For leagues with country info, create unique identifier
        leagueName = `${leagueName} (${league.country})`;
      } else {
        // For string leagues, try to differentiate common names
        if (leagueName === 'Premier League' || leagueName.includes('Premier League')) {
          // Default to England if no country specified
          leagueName = leagueName.includes('England') ? leagueName : `${leagueName} (England)`;
        } else if (leagueName === 'Premiership' || leagueName.includes('Premiership')) {
          // Default to Scotland for Premiership
          leagueName = leagueName.includes('Scotland') ? leagueName : `${leagueName} (Scotland)`;
        }
      }

      if (!groups[leagueName]) {
        groups[leagueName] = [];
      }
      groups[leagueName].push(match);
    });

    // Define league priority order (Champions League first, then top European leagues)
    const leaguePriority: Record<string, number> = {
      // European Competitions (Highest Priority)
      'Champions League': 1,
      'Champions League (Europe)': 1,
      'UEFA Champions League': 1,
      'Champions League (World)': 1,
      'UEFA Champions League (World)': 1,
      'Europa League': 2,
      'Europa League (Europe)': 2,
      'UEFA Europa League': 2,
      'Europa League (World)': 2,
      'UEFA Europa League (World)': 2,
      'Conference League': 3,
      'Conference League (Europe)': 3,
      'Conference League (World)': 3,
      'UEFA Conference League': 3,
      'UEFA Conference League (World)': 3,

      // Top 5 European Leagues & Cups
      'Premier League (England)': 10,
      'FA Cup (England)': 10.1,
      'FA Cup': 10.1,
      'Carabao Cup (England)': 10.2,
      'Carabao Cup': 10.2,

      'LaLiga (Spain)': 11,
      'La Liga (Spain)': 11,
      'Primera División (Spain)': 11,
      'Spanish La Liga': 11,
      'Copa del Rey (Spain)': 11.1,
      'Copa del Rey': 11.1,

      'Serie A (Italy)': 12,
      'Italian Serie A': 12,
      'Coppa Italia (Italy)': 12.1,
      'Coppa Italia': 12.1,

      'Bundesliga (Germany)': 13,
      'German Bundesliga': 13,
      'DFB Pokal (Germany)': 13.1,
      'DFB Pokal': 13.1,

      'Ligue 1 (France)': 14,
      'French Ligue 1': 14,
      'Coupe de France (France)': 14.1,
      'Coupe de France': 14.1,

      // Other Top European Leagues (Priority 15-20)
      'Primeira Liga (Portugal)': 15,
      'Portuguese Liga': 15,
      'Liga Portugal': 15,

      'Eredivisie (Netherlands)': 16,
      'Dutch Eredivisie': 16,
      'Eredivisie': 16,

      'Premiership (Scotland)': 17,
      'Scottish Premiership': 17,
      'Scottish Premier League': 17,

      'Jupiler Pro League (Belgium)': 18,
      'Jupiler Pro League': 18,
      'Belgian Pro League': 18,
      'Pro League (Belgium)': 18,

      'Süper Lig (Turkey)': 19,
      'Süper Lig': 19,
      'Turkish Super Lig': 19,

      // All other leagues get default priority (100) and sort alphabetically
      ...customPriorities // Merge custom priorities from admin panel
    };

    // Priority map by League ID (Overrules string matching)
    // IDs based on API-Football standard
    const leaguePriorityById: Record<number, number> = {
      2: 1,    // UEFA Champions League
      3: 2,    // UEFA Europa League
      848: 3,  // UEFA Conference League
      39: 10,  // Premier League (England)
      140: 11, // La Liga (Spain)
      135: 12, // Serie A (Italy)
      78: 13,  // Bundesliga (Germany)
      61: 14,  // Ligue 1 (France)
      45: 10.1, // FA Cup (England)
      48: 10.2, // Carabao Cup (England)
      143: 11.1, // Copa del Rey (Spain)
      137: 12.1, // Coppa Italia (Italy)
      529: 13.1, // DFB Pokal (Germany)
      66: 14.1, // Coupe de France (France)
    };

    // Sort groups by pinned status first, then by priority
    const sortedGroups = Object.entries(groups).sort(([leagueA, matchesA], [leagueB, matchesB]) => {
      const isPinnedA = pinnedLeagues.has(leagueA);
      const isPinnedB = pinnedLeagues.has(leagueB);

      // Pinned leagues always come first
      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;

      // If both pinned or both not pinned, sort by priority
      const getPriority = (league: string, matches: Match[]) => {
        // Try exact ID match first (Most reliable)
        const leagueId = Number(matches[0]?.league?.id);
        if (!isNaN(leagueId) && leaguePriorityById[leagueId] !== undefined) {
          return leaguePriorityById[leagueId];
        }

        // Try exact string match
        if (leaguePriority[league] !== undefined) return leaguePriority[league];

        // Try match with country if not already present
        const simpleName = league.split('(')[0].trim();
        const country = matches[0]?.league?.country;
        if (country) {
          const nameWithCountry = `${simpleName} (${country})`;
          if (leaguePriority[nameWithCountry] !== undefined) return leaguePriority[nameWithCountry];
        }

        return 100; // Default
      };

      const priorityA = getPriority(leagueA, matchesA);
      const priorityB = getPriority(leagueB, matchesB);

      if (priorityA !== priorityB) return priorityA - priorityB;

      // Same priority — sort alphabetically by country first
      // Safely access country, handling potential string/undefined cases
      const getCountry = (matches: Match[]) => {
        const league = matches[0]?.league;
        return (typeof league === 'object' ? league?.country : '') || '';
      };

      const countryA = getCountry(matchesA);
      const countryB = getCountry(matchesB);

      const countryCompare = countryA.localeCompare(countryB);
      if (countryCompare !== 0) return countryCompare;

      // Same country — sort alphabetically by league name
      return leagueA.localeCompare(leagueB);
    });

    // Convert back to object maintaining sorted order
    const sortedGroupsObject: Record<string, Match[]> = {};
    sortedGroups.forEach(([leagueName, matches]) => {
      sortedGroupsObject[leagueName] = matches;
    });

    return sortedGroupsObject;
  }, [filteredMatches, activeFilterTab, pinnedLeagues, customPriorities]);

  // Get live matches count
  const liveMatchesCount = matches.filter(match => ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(match.status)).length;

  // Scroll to first match when search query changes
  useEffect(() => {
    if (searchQuery && filteredMatches.length > 0) {
      // Small delay to ensure the DOM is updated with the filtered results
      const timer = setTimeout(() => {
        const firstMatchId = filteredMatches[0]?.id;
        if (firstMatchId && matchCardRefs.current[firstMatchId]) {
          matchCardRefs.current[firstMatchId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredMatches]);

  const handleMatchClick = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      navigateToMatch(match);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setCurrentView("player");
  };

  const handleLeagueHeaderClick = (leagueName: string, league: any) => {
    console.log('League clicked:', { leagueName, league }); // Debug log

    // Map league names to the correct route format that matches LeagueDetailsPage mapping
    const getLeagueRoute = (leagueName: string, league: any) => {
      // Create a comprehensive mapping that matches LeagueDetailsPage exactly
      const leagueRouteMapping: Record<string, string> = {
        // European competitions
        'champions-league': 'europe/champions-league',
        'uefa-champions-league': 'europe/champions-league',
        'champions-league-(europe)': 'europe/champions-league',
        'europa-league': 'europe/europa-league',
        'uefa-europa-league': 'europe/europa-league',
        'europa-league-(europe)': 'europe/europa-league',

        // England
        'premier-league': 'england/premier-league',
        'premier-league-(england)': 'england/premier-league',
        'championship': 'england/championship',
        'championship-(england)': 'england/championship',
        'fa-cup': 'england/fa-cup',
        'fa-cup-(england)': 'england/fa-cup',

        // Spain
        'laliga': 'spain/laliga',
        'laliga-(spain)': 'spain/laliga',
        'la-liga': 'spain/laliga',
        'la-liga-(spain)': 'spain/laliga',
        'spanish-la-liga': 'spain/laliga',
        'primera-división-(spain)': 'spain/laliga',
        'segunda-division': 'spain/segunda-division',
        'segunda-division-(spain)': 'spain/segunda-division',

        // Italy
        'serie-a': 'italy/serie-a',
        'serie-a-(italy)': 'italy/serie-a',
        'italian-serie-a': 'italy/serie-a',
        'serie-b': 'italy/serie-b',
        'serie-b-(italy)': 'italy/serie-b',

        // Germany
        'bundesliga': 'germany/bundesliga',
        'bundesliga-(germany)': 'germany/bundesliga',
        'german-bundesliga': 'germany/bundesliga',
        '2-bundesliga': 'germany/2-bundesliga',
        '2-bundesliga-(germany)': 'germany/2-bundesliga',

        // France
        'ligue-1': 'france/ligue-1',
        'ligue-1-(france)': 'france/ligue-1',
        'french-ligue-1': 'france/ligue-1',
        'ligue-2': 'france/ligue-2',
        'ligue-2-(france)': 'france/ligue-2',

        // Other European leagues
        'eredivisie': 'netherlands/eredivisie',
        'eredivisie-(netherlands)': 'netherlands/eredivisie',
        'dutch-eredivisie': 'netherlands/eredivisie',
        'primeira-liga': 'portugal/primeira-liga',
        'primeira-liga-(portugal)': 'portugal/primeira-liga',
        'portuguese-liga': 'portugal/primeira-liga',
        'scottish-premiership': 'scotland/scottish-premiership',
        'scottish-premiership-(scotland)': 'scotland/scottish-premiership',
        'premiership-(scotland)': 'scotland/scottish-premiership',
        'belgian-pro-league': 'belgium/belgian-pro-league',
        'belgian-pro-league-(belgium)': 'belgium/belgian-pro-league',
        'austrian-bundesliga': 'austria/austrian-bundesliga',
        'austrian-bundesliga-(austria)': 'austria/austrian-bundesliga',

        // International
        'world-cup': 'fifa/world-cup',
        'fifa-world-cup': 'fifa/world-cup',
        'fifa-club-world-cup': 'fifa/world-cup',
        'professional-football-league': 'nigeria/professional-football-league',
        'professional-football-league-(nigeria)': 'nigeria/professional-football-league',
      };

      // Normalize the league name for lookup
      const normalizedName = leagueName.toLowerCase().replace(/\s+/g, '-');

      // Try direct mapping first
      if (leagueRouteMapping[normalizedName]) {
        return leagueRouteMapping[normalizedName];
      }

      // If no direct mapping found, try to extract from league object
      if (typeof league === 'object' && league?.country && league?.name) {
        const country = league.country.toLowerCase().replace(/\s+/g, '-');
        const leagueSlug = league.name.toLowerCase().replace(/\s+/g, '-');

        // Handle special cases for country names
        const countryMapping: Record<string, string> = {
          'world': 'europe', // For international competitions
          'england': 'england',
          'spain': 'spain',
          'italy': 'italy',
          'germany': 'germany',
          'france': 'france',
          'netherlands': 'netherlands',
          'portugal': 'portugal',
          'scotland': 'scotland',
          'belgium': 'belgium',
          'austria': 'austria'
        };

        const mappedCountry = countryMapping[country] || country;
        return `${mappedCountry}/${leagueSlug}`;
      }

      // Parse leagueName that includes country in parentheses like "Premier League (England)"
      const match = leagueName.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const leagueSlug = match[1].trim().toLowerCase().replace(/\s+/g, '-');
        const country = match[2].trim().toLowerCase().replace(/\s+/g, '-');
        return `${country}/${leagueSlug}`;
      }

      // Last resort: return null to indicate no mapping found
      return null;
    };

    const routePath = getLeagueRoute(leagueName, league);

    if (routePath) {
      // Navigate to the league details page with standings tab
      navigate(`/leagues/${routePath}?tab=standings`);
    } else {
      // If no mapping found, show an alert or navigate to general leagues page
      console.warn(`No route mapping found for league: ${leagueName}`);
      // Navigate to the general leagues page as fallback
      navigate('/leagues');
    }
  };

  const toggleLeagueCollapse = (leagueName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the league header click
    setCollapsedLeagues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leagueName)) {
        newSet.delete(leagueName);
      } else {
        newSet.add(leagueName);
      }
      return newSet;
    });
  };

  const togglePinLeague = (leagueName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the league header click
    setPinnedLeagues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leagueName)) {
        newSet.delete(leagueName);
      } else {
        newSet.add(leagueName);
      }
      localStorage.setItem('livescore_pinned_leagues', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Update layout top content
  useEffect(() => {
    setTopContent(
      <SportTabs
        activeSport={activeSport}
        onSportChange={(sport) => {
          setActiveSport(sport);
          setActiveFilterTab('all');
        }}
        favoritesCount={favoriteIds.length}
      />
    );
    // Cleanup on unmount
    return () => setTopContent(null);
  }, [activeSport, setTopContent, favoriteIds]);

  const filterOptions = [
    { key: "all", label: "All", count: matches.filter(m => m.status === 'FT' || m.status === 'SCHEDULED' || ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY'].includes(m.status)).length },
    { key: "live", label: "Live", count: liveMatchesCount },
    { key: "today", label: "Today", count: matches.length },
  ];

  // Render player profile view
  if (currentView === 'player' && selectedPlayerId) {
    return (
      <div className="w-full overflow-visible">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentView('home');
              setSelectedPlayerId(null);
            }}
            className="mb-4"
          >
            ← Back to Matches
          </Button>
          <PlayerProfile playerId={selectedPlayerId} onBack={() => setCurrentView("home")} />
        </div>
      </div>
    );
  }

  // Scroll to the first matching match when search is performed
  useEffect(() => {
    if (searchQuery.trim() && filteredMatches.length > 0) {
      const timer = setTimeout(() => {
        const firstMatchId = filteredMatches[0]?.id;
        if (firstMatchId && matchCardRefs.current[firstMatchId]) {
          matchCardRefs.current[firstMatchId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredMatches]);

  return (
    <div className="w-full overflow-visible">
      {currentView === "home" ? (
        <>
          <MetaTags />

          <div className="space-y-6">
            {/* Date Navigation */}
            <DateNavigation
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />

            {/* Filter Tabs */}
            <FilterTabs
              activeFilter={activeFilterTab}
              onFilterChange={setActiveFilterTab}
            />

            {/* Sliding Calendar */}
            {/* <div className="mb-6">
              <SlidingCalendar 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect}
              />
            </div> */}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-card border-b border-gray-100 dark:border-border last:border-b-0">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Star Icon Skeleton */}
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-200 dark:bg-muted rounded animate-pulse" />

                      {/* Teams Section Skeleton */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Home Team */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 dark:bg-muted rounded w-32 animate-pulse" />
                        </div>
                        {/* Away Team */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 dark:bg-muted rounded w-28 animate-pulse" />
                        </div>
                      </div>

                      {/* Score/Time Skeleton */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[60px]">
                        <div className="h-6 w-8 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                        <div className="h-6 w-8 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                      </div>

                      {/* Odds Skeleton */}
                      <div className="flex flex-col gap-1 flex-shrink-0 min-w-[50px]">
                        <div className="h-4 w-10 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                        <div className="h-4 w-10 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                        <div className="h-4 w-10 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-[#2a2a2a] rounded-lg p-8 text-center border border-red-800">
                <div className="text-red-400 mb-4">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-white">Unable to Load Matches</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'Something went wrong while fetching match data.'}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Match Groups by League */}
            {!isLoading && !error && (
              <>
                {Object.entries(groupedMatches).map(([leagueName, matches]) => {
                  const firstMatch = matches[0];
                  const league = firstMatch?.league;

                  return (
                    <div key={leagueName} className="mb-4">
                      {/* League Header */}
                      <div
                        className={`flex items-center gap-3 mb-2 px-4 py-2 bg-[#f2f2f2] dark:bg-card rounded-t-lg border-b border-gray-200 dark:border-border ${isFootball ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => isFootball && handleLeagueHeaderClick(leagueName, league)}
                      >
                        {/* Star Icon */}
                        <button
                          className="flex-shrink-0 text-gray-400 dark:text-muted-foreground hover:text-yellow-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement league favorite toggling
                          }}
                        >
                          <Star className="w-5 h-5" />
                        </button>

                        {/* Flag */}
                        {league?.flag && (
                          <div className="flex-shrink-0">
                            <img
                              src={league.flag}
                              alt={`${league.country} flag`}
                              className="w-6 h-4 object-cover shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* League Info */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <h2 className="text-gray-700 dark:text-foreground font-bold text-sm leading-tight truncate">
                            {leagueName.split('(')[0].trim()}
                          </h2>
                          <span className="text-gray-500 dark:text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                            {league?.country || 'International'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {/* Pin Icon */}
                          <button
                            className={`transition-colors ${pinnedLeagues.has(leagueName) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={(e) => togglePinLeague(leagueName, e)}
                            title={pinnedLeagues.has(leagueName) ? 'Unpin league' : 'Pin league'}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={pinnedLeagues.has(leagueName) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 transform rotate-45"
                            >
                              <line x1="12" y1="17" x2="12" y2="22"></line>
                              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                            </svg>
                          </button>

                          {/* Standings/Menu Icon (Red numeric list lookalike) - Football only */}
                          {isFootball && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeagueHeaderClick(leagueName, league);
                              }}
                              className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 dark:hover:bg-accent rounded transition-colors"
                            >
                              <div className="flex flex-col gap-[2px] items-start">
                                <div className="flex gap-1 items-center">
                                  <span className="text-[8px] font-bold text-red-500 leading-none">1</span>
                                  <div className="w-3 h-[2px] bg-red-500"></div>
                                </div>
                                <div className="flex gap-1 items-center">
                                  <span className="text-[8px] font-bold text-red-500 leading-none">2</span>
                                  <div className="w-3 h-[2px] bg-red-500"></div>
                                </div>
                                <div className="flex gap-1 items-center">
                                  <span className="text-[8px] font-bold text-red-500 leading-none">3</span>
                                  <div className="w-3 h-[2px] bg-red-500"></div>
                                </div>
                              </div>
                            </button>
                          )}

                          {/* Collapse Icon */}
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 dark:text-muted-foreground transition-transform ${collapsedLeagues.has(leagueName) ? 'transform -rotate-180' : ''
                              }`}
                          />
                        </div>
                      </div>

                      {/* Matches List */}
                      {!collapsedLeagues.has(leagueName) && (
                        <div className="space-y-0">
                          {matches.map((match) => (
                            <div
                              key={match.id}
                              ref={(el) => {
                                if (el) {
                                  matchCardRefs.current[match.id] = el;
                                }
                              }}
                            >
                              <CompactMatchCard
                                match={match}
                                onClick={isFootball ? handleMatchClick : undefined}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Object.keys(groupedMatches).length === 0 && (
                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No Matches Found</h3>
                    <p className="text-muted-foreground mb-4">
                      No matches found for {format(selectedDate, 'MMMM d, yyyy')}.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : currentView === "match" && selectedMatchId ? (
        <MatchDetails
          matchId={selectedMatchId}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "player" && selectedPlayerId ? (
        <PlayerProfile
          playerId={selectedPlayerId}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "standings" && selectedLeagueForStandings ? (
        <LeagueStandings
          leagueName={selectedLeagueForStandings}
          onBack={() => setCurrentView("home")}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">View not found</p>
        </div>
      )
      }
    </div >
  );
};

export default Index;
