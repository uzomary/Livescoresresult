import { Pin, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { usePinnedLeagues } from '@/hooks/use-pinned-leagues';
import { useQuery } from '@tanstack/react-query';
import { footballApi } from '@/services/footballApi';
import { useState, useEffect } from 'react';

interface League {
  id: string;
  name: string;
  type: 'club' | 'country' | 'international';
  logo?: string;
  flag?: string;
  countryCode?: string;
  path?: string;
  apiLeagueId?: number;
}

// Mapping of our league IDs to API-Football league IDs
const LEAGUE_API_MAPPING: Record<string, number> = {
  'premier-league-england': 39,      // Premier League
  'laliga': 140,                      // La Liga
  'bundesliga': 78,                   // Bundesliga
  'serie-a': 135,                     // Serie A
  'ligue-1': 61,                      // Ligue 1
  'eredivisie': 88,                   // Eredivisie
  'champions-league': 2,              // UEFA Champions League
  'europa-league': 3,                 // UEFA Europa League
  'conference-league': 848,           // UEFA Europa Conference League
  'uefa-nations-league': 5,           // UEFA Nations League
  'world-cup': 1,                     // FIFA World Cup
  'euro': 4,                          // European Championship
  'copa-america': 9,                  // Copa America
  'africa-cup-of-nations': 6,         // Africa Cup of Nations
  'world-cup-women': 13,              // FIFA Women's World Cup
};

// Base league configuration with paths
const BASE_LEAGUES: Omit<League, 'logo' | 'flag'>[] = [
  { id: 'premier-league-england', name: 'Premier League', type: 'country', path: '/leagues/england/premier-league', apiLeagueId: 39 },
  { id: 'laliga', name: 'LaLiga', type: 'country', path: '/leagues/spain/laliga', apiLeagueId: 140 },
  { id: 'bundesliga', name: 'Bundesliga', type: 'country', path: '/leagues/germany/bundesliga', apiLeagueId: 78 },
  { id: 'serie-a', name: 'Serie A', type: 'country', path: '/leagues/italy/serie-a', apiLeagueId: 135 },
  { id: 'ligue-1', name: 'Ligue 1', type: 'country', path: '/leagues/france/ligue-1', apiLeagueId: 61 },
  { id: 'eredivisie', name: 'Eredivisie', type: 'country', path: '/leagues/netherlands/eredivisie', apiLeagueId: 88 },
  { id: 'africa-cup-of-nations', name: 'Africa Cup of Nations', type: 'international', path: '/leagues/africa/africa-cup-of-nations', apiLeagueId: 6 },
  { id: 'euro', name: 'Euro', type: 'international', path: '/leagues/europe/euro-championship', apiLeagueId: 4 },
  { id: 'champions-league', name: 'Champions League', type: 'international', path: '/leagues/europe/champions-league', apiLeagueId: 2 },
  { id: 'europa-league', name: 'Europa League', type: 'international', path: '/leagues/europe/europa-league', apiLeagueId: 3 },
  { id: 'conference-league', name: 'Conference League', type: 'international', path: '/leagues/europe/uefa-conference-league', apiLeagueId: 848 },
  { id: 'uefa-nations-league', name: 'UEFA Nations League', type: 'international', path: '/leagues/europe/uefa-nations-league', apiLeagueId: 5 },
  { id: 'copa-america', name: 'Copa América', type: 'international', path: '/leagues/south-america/copa-america', apiLeagueId: 9 },
  { id: 'world-cup', name: 'World Cup', type: 'international', path: '/leagues/fifa/world-cup', apiLeagueId: 1 },
  { id: 'world-cup-women', name: 'World Cup Women', type: 'international', path: '/leagues/fifa/womens-world-cup', apiLeagueId: 13 },
];

interface SidebarProps {
  selectedLeague?: string;
  onLeagueSelect?: (leagueId: string) => void;
}

export const Sidebar = ({ selectedLeague, onLeagueSelect }: SidebarProps) => {
  const navigate = useNavigate();
  const { pinnedLeagueIds, togglePin, isPinned } = usePinnedLeagues();
  const [leagues, setLeagues] = useState<League[]>(BASE_LEAGUES as League[]);

  // Fetch leagues data from API
  const { data: apiLeaguesData } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => footballApi.getLeagues(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });

  // Merge API data with base leagues configuration
  useEffect(() => {
    if (apiLeaguesData?.response) {
      const enrichedLeagues = BASE_LEAGUES.map(baseLeague => {
        // Find matching API league data
        const apiLeague = apiLeaguesData.response.find(
          (apiData: any) => apiData.league.id === baseLeague.apiLeagueId
        );

        if (apiLeague) {
          return {
            ...baseLeague,
            logo: apiLeague.league.logo,
            flag: apiLeague.country.flag,
          };
        }

        return baseLeague as League;
      });

      setLeagues(enrichedLeagues);
    }
  }, [apiLeaguesData]);

  // Fetch countries data
  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => footballApi.getCountries(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const [showAllCountries, setShowAllCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Filter countries based on search
  const filteredCountries = (countriesData?.response || []).filter((c: any) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const displayedCountries = showAllCountries || countrySearch
    ? filteredCountries
    : filteredCountries.slice(0, 10);

  const pinnedLeagues = leagues.filter(l => isPinned(l.id));
  const otherLeagues = leagues.filter(l => !isPinned(l.id));

  const renderLeagueItem = (league: League) => {
    const isActive = selectedLeague === league.id;
    const isLeaguePinned = isPinned(league.id);

    return (
      <div key={league.id} className="relative group">
        <button
          onClick={() => {
            onLeagueSelect?.(league.id);
            if (league.path) navigate(league.path);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors relative",
            isActive
              ? "bg-[#e5e7eb] text-black"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {/* Icon/Flag */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {league.type === 'country' && league.flag ? (
              <img
                src={league.flag}
                alt={league.name}
                className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : league.logo ? (
              <img
                src={league.logo}
                alt={league.name}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-4 h-3 bg-gray-300 rounded-[1px]" />
            )}
          </div>

          {/* Name */}
          <span className="text-[13px] font-medium truncate flex-1 leading-none pt-0.5">
            {league.name}
          </span>

          {/* Active Indicator Pin (Always visible if active) */}
          {isActive && (
            <Pin className="w-3.5 h-3.5 text-blue-500 fill-current transform rotate-45 mr-6" /> // Added margin right to not overlap with hover pin
          )}
        </button>

        {/* Hover Pin Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePin(league.id);
          }}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-200 transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          title={isLeaguePinned ? "Unpin league" : "Pin league"}
        >
          <Pin className={cn("w-3.5 h-3.5", isLeaguePinned ? "fill-current text-blue-500" : "")} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#f8f9fa] h-full overflow-y-auto custom-scrollbar">
      {/* Pinned Leagues Header */}
      {pinnedLeagues.length > 0 && (
        <>
          <div className="px-4 py-3 mb-1">
            <div className="flex items-center gap-3 text-[#001e28]">
              <Pin className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold tracking-wider uppercase">PINNED LEAGUES</span>
            </div>
          </div>
          <div className="space-y-[1px] mb-4">
            {pinnedLeagues.map(renderLeagueItem)}
          </div>
        </>
      )}

      {/* All Competitions Header */}
      <div className="px-4 py-3 mb-1 mt-2 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 text-[#001e28]">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">ALL COMPETITIONS</span>
        </div>
      </div>

      {/* Other Leagues List */}
      <div className="space-y-[1px] pb-4">
        {otherLeagues.map(renderLeagueItem)}
      </div>

      {/* Countries Header */}
      <div className="px-4 py-3 mb-1 mt-2 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-[#001e28] mb-3">
          <span className="text-xs font-bold tracking-wider uppercase">COUNTRIES</span>
          <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-600">{filteredCountries.length}</span>
        </div>

        {/* Search Box */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search countries..."
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Countries List */}
      <div className="space-y-[1px] pb-8">
        {displayedCountries.map((country: any, index: number) => (
          <div
            key={`${country.code}-${index}`}
            onClick={() => navigate(`/country/${country.name.toLowerCase().replace(/\s+/g, '-')}`)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer transition-colors text-gray-700 hover:bg-gray-100"
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {country.flag ? (
                <img src={country.flag} alt={country.name} className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm" />
              ) : (
                <span className="text-[10px] font-bold">{country.code}</span>
              )}
            </div>
            <span className="text-[13px] font-medium truncate flex-1 leading-none pt-0.5">{country.name}</span>
          </div>
        ))}

        {/* Show More / Show Less Button */}
        {filteredCountries.length > 10 && !countrySearch && (
          <button
            onClick={() => setShowAllCountries(!showAllCountries)}
            className="w-full text-center text-xs font-bold text-gray-500 hover:text-black py-3 transition-colors uppercase tracking-wide"
          >
            {showAllCountries ? 'Show Less' : `Show All Matches`}
          </button>
        )}

        {filteredCountries.length === 0 && (
          <div className="text-xs text-gray-400 italic text-center py-2">
            No countries found
          </div>
        )}
      </div>
    </div>
  );
};
