import { useState } from 'react';
import { Trophy, Star, Globe, Users, Award, Zap, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface League {
  id: string;
  name: string;
  icon: React.ReactNode;
  country?: string;
  isActive?: boolean;
  isPopular?: boolean;
}

const leagues: League[] = [
  // World Cup
  { id: 'world-cup', name: 'FIFA World Cup', icon: <Award className="w-4 h-4" />, country: 'FIFA', isPopular: true },
  
  // European Competitions (Top Priority)
  { id: 'champions-league', name: 'Champions League', icon: <Star className="w-4 h-4" />, country: 'Europe', isPopular: true },
  { id: 'europa-league', name: 'Europa League', icon: <Globe className="w-4 h-4" />, country: 'Europe', isPopular: true },
  
  // England
  { id: 'premier-league-england', name: 'Premier League', icon: <Trophy className="w-4 h-4" />, country: 'England', isPopular: true },
  { id: 'championship', name: 'Championship', icon: <Trophy className="w-4 h-4" />, country: 'England' },
  { id: 'fa-cup', name: 'FA Cup', icon: <Zap className="w-4 h-4" />, country: 'England' },
  
  // Spain
  { id: 'laliga', name: 'LaLiga', icon: <Trophy className="w-4 h-4" />, country: 'Spain', isPopular: true },
  { id: 'segunda-division', name: 'Segunda División', icon: <Trophy className="w-4 h-4" />, country: 'Spain' },
  { id: 'copa-del-rey', name: 'Copa del Rey', icon: <Trophy className="w-4 h-4" />, country: 'Spain' },
  
  // Italy
  { id: 'serie-a', name: 'Serie A', icon: <Trophy className="w-4 h-4" />, country: 'Italy', isPopular: true },
  { id: 'serie-b', name: 'Serie B', icon: <Trophy className="w-4 h-4" />, country: 'Italy' },
  
  // Germany
  { id: 'bundesliga', name: 'Bundesliga', icon: <Trophy className="w-4 h-4" />, country: 'Germany', isPopular: true },
  { id: '2-bundesliga', name: '2. Bundesliga', icon: <Trophy className="w-4 h-4" />, country: 'Germany' },
  
  // France
  { id: 'ligue-1', name: 'Ligue 1', icon: <Trophy className="w-4 h-4" />, country: 'France', isPopular: true },
  { id: 'ligue-2', name: 'Ligue 2', icon: <Trophy className="w-4 h-4" />, country: 'France' },
  
  // Netherlands
  { id: 'eredivisie', name: 'Eredivisie', icon: <Trophy className="w-4 h-4" />, country: 'Netherlands' },
  
  // Portugal
  { id: 'primeira-liga', name: 'Primeira Liga', icon: <Trophy className="w-4 h-4" />, country: 'Portugal' },
  
  // Scotland
  { id: 'scottish-premiership', name: 'Scottish Premiership', icon: <Trophy className="w-4 h-4" />, country: 'Scotland' },
  
  // Belgium
  { id: 'belgian-pro-league', name: 'Belgian Pro League', icon: <Trophy className="w-4 h-4" />, country: 'Belgium' },
  
  // Austria
  { id: 'austrian-bundesliga', name: 'Austrian Bundesliga', icon: <Trophy className="w-4 h-4" />, country: 'Austria' },
  
  // Africa
  { id: 'professional-football-league', name: 'Professional Football League', icon: <Users className="w-4 h-4" />, country: 'Nigeria' },
];

const Competitions = () => {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  const handleLeagueClick = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // Here you would typically navigate to the league page or update the main content
    console.log('Selected league:', leagueId);
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         league.country?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !showOnlyPopular || league.isPopular;
    return matchesSearch && matchesFilter;
  });

  const groupedLeagues = filteredLeagues.reduce((acc, league) => {
    const country = league.country || 'Other';
    if (!acc[country]) acc[country] = [];
    acc[country].push(league);
    return acc;
  }, {} as Record<string, League[]>);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0f0f0f]">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/10 lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-[#ff6b00]" />
            <h1 className="text-xl font-bold text-white">Leagues</h1>
          </div>
          
          {/* Mobile Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leagues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2a2a2a] border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => setShowOnlyPopular(!showOnlyPopular)}
              className={cn(
                "px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                showOnlyPopular
                  ? "bg-[#ff6b00] text-white"
                  : "bg-[#2a2a2a] text-gray-400 hover:text-white"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium">Popular</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-[#1a1a1a] border-r border-white/10 h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-[#ff6b00]" />
              <h1 className="text-xl font-bold text-white">Leagues</h1>
            </div>
            
            {/* Desktop Search & Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search leagues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#2a2a2a] border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setShowOnlyPopular(!showOnlyPopular)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                  showOnlyPopular
                    ? "bg-[#ff6b00] text-white"
                    : "bg-[#2a2a2a] text-gray-400 hover:text-white"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Show Popular Only</span>
              </button>
            </div>
          </div>

          {/* Desktop League List */}
          <div className="py-2">
            {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
              <div key={country} className="mb-4">
                <div className="px-6 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {country}
                  </h3>
                </div>
                {countryLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueClick(league.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-6 py-3 text-left transition-colors",
                      selectedLeague === league.id
                        ? "bg-[#ff6b00]/20 text-white border-r-2 border-[#ff6b00]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex-shrink-0 text-[#ff6b00]">
                      {league.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {league.name}
                      </div>
                    </div>
                    {league.isPopular && (
                      <Badge variant="secondary" className="bg-[#ff6b00]/20 text-[#ff6b00] text-xs">
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:p-8">
          {/* Mobile League Grid */}
          <div className="lg:hidden px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLeagues.map((league) => (
                <Card
                  key={league.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-white/10 bg-[#1a1a1a] hover:bg-[#2a2a2a]",
                    selectedLeague === league.id && "ring-2 ring-[#ff6b00] bg-[#ff6b00]/10"
                  )}
                  onClick={() => handleLeagueClick(league.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-[#ff6b00]">
                        {league.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">
                          {league.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {league.country}
                        </p>
                      </div>
                      {league.isPopular && (
                        <Badge variant="secondary" className="bg-[#ff6b00]/20 text-[#ff6b00] text-xs">
                          ★
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Desktop Content Area */}
          <div className="hidden lg:block">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8">
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-[#ff6b00] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedLeague ? `Selected: ${leagues.find(l => l.id === selectedLeague)?.name}` : 'Select a League'}
                </h2>
                <p className="text-gray-400">
                  {selectedLeague 
                    ? 'League content and matches would be displayed here'
                    : 'Choose a league from the sidebar to view matches and details'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
