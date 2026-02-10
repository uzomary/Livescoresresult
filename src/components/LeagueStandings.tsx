import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { assets } from "@/assets/images";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { footballApi } from '@/services/footballApi';

interface StandingsTeam {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface LeagueStandingsProps {
  leagueName: string;
  onBack: () => void;
}

// Map league names to API league IDs
const getLeagueId = (leagueName: string): number => {
  const leagueMap: Record<string, number> = {
    'Premier League (England)': 39,
    'Premier League': 39,
    'LaLiga (Spain)': 140,
    'LaLiga': 140,
    'La Liga (Spain)': 140,
    'La Liga': 140,
    'Serie A (Italy)': 135,
    'Serie A': 135,
    'Bundesliga (Germany)': 78,
    'Bundesliga': 78,
    'Ligue 1 (France)': 61,
    'Ligue 1': 61,
    'Champions League': 2,
    'Champions League (Europe)': 2,
    'UEFA Champions League': 2,
    'Europa League': 3,
    'Europa League (Europe)': 3,
    'UEFA Europa League': 3,
  };
  
  return leagueMap[leagueName] || 39; // Default to Premier League
};

const getFormIcon = (result: string) => {
  switch (result) {
    case 'W':
      return <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>;
    case 'D':
      return <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>;
    case 'L':
      return <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>;
    default:
      return null;
  }
};

const getPositionIcon = (position: number) => {
  if (position <= 4) {
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>; // Champions League
  } else if (position <= 6) {
    return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>; // Europa League
  } else if (position >= 18) {
    return <div className="w-2 h-2 bg-red-500 rounded-full"></div>; // Relegation
  }
  return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
};

export const LeagueStandings: React.FC<LeagueStandingsProps> = ({ leagueName, onBack }) => {
  const leagueId = getLeagueId(leagueName);
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = React.useState<'short' | 'full' | 'form'>('short');
  
  const { data: standingsData, isLoading, error } = useQuery({
    queryKey: ['standings', leagueId, currentYear],
    queryFn: () => footballApi.getLeagueStandings(leagueId, currentYear),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const standings = standingsData?.response || [];

  const tabs = [
    { id: 'short' as const, label: 'Short Table' },
    { id: 'full' as const, label: 'Full Table' },
    { id: 'form' as const, label: 'Form' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-[#333]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">{leagueName} - Standings</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

{isLoading ? (
          <Card className="bg-[#2a2a2a] border-gray-700 p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full bg-gray-700" />
                  <Skeleton className="w-6 h-6 rounded bg-gray-700" />
                  <Skeleton className="flex-1 h-6 rounded bg-gray-700" />
                  <Skeleton className="w-12 h-6 rounded bg-gray-700" />
                </div>
              ))}
            </div>
          </Card>
        ) : error ? (
          <Card className="bg-[#2a2a2a] border-gray-700 p-8 text-center">
            <p className="text-red-400 mb-2">Failed to load standings</p>
            <p className="text-gray-400">Please try again later</p>
          </Card>
        ) : standings.length === 0 ? (
          <Card className="bg-[#2a2a2a] border-gray-700 p-8 text-center">
            <p className="text-gray-400">No standings available for this league</p>
          </Card>
        ) : (
          <Card className="bg-[#2a2a2a] border-gray-700">
            <div className="overflow-x-auto">
              {activeTab === 'short' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Team</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">P</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">GD</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team) => (
                      <tr 
                        key={team.team.id} 
                        className="border-b border-gray-800 hover:bg-[#333] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getPositionIcon(team.rank)}
                            <span className="font-medium">{team.rank}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={team.team.logo} 
                              alt={`${team.team.name} logo`}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = assets.preloader;
                              }}
                            />
                            <span className="font-medium">{team.team.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-gray-300">{team.all.played}</td>
                        <td className="text-center py-3 px-2">
                          <span className={team.goalsDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {team.goalsDiff >= 0 ? '+' : ''}{team.goalsDiff}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2 font-bold text-white">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'full' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Team</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">P</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">W</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">D</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">L</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">GF</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">GA</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">GD</th>
                      <th className="text-center py-3 px-2 text-gray-400 font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team) => (
                      <tr 
                        key={team.team.id} 
                        className="border-b border-gray-800 hover:bg-[#333] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getPositionIcon(team.rank)}
                            <span className="font-medium">{team.rank}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={team.team.logo} 
                              alt={`${team.team.name} logo`}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = assets.preloader;
                              }}
                            />
                            <span className="font-medium">{team.team.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-gray-300">{team.all.played}</td>
                        <td className="text-center py-3 px-2 text-green-400">{team.all.win}</td>
                        <td className="text-center py-3 px-2 text-yellow-400">{team.all.draw}</td>
                        <td className="text-center py-3 px-2 text-red-400">{team.all.lose}</td>
                        <td className="text-center py-3 px-2 text-gray-300">{team.all.goals.for}</td>
                        <td className="text-center py-3 px-2 text-gray-300">{team.all.goals.against}</td>
                        <td className="text-center py-3 px-2">
                          <span className={team.goalsDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {team.goalsDiff >= 0 ? '+' : ''}{team.goalsDiff}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2 font-bold text-white">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'form' && (
                <div className="p-4">
                  <div className="grid gap-3">
                    {standings.map((team) => (
                      <div 
                        key={team.team.id}
                        className="flex items-center justify-between p-4 bg-[#333] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[3rem]">
                            {getPositionIcon(team.rank)}
                            <span className="font-medium text-gray-300">{team.rank}</span>
                          </div>
                          <img 
                            src={team.team.logo} 
                            alt={`${team.team.name} logo`}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/preloader.png';
                            }}
                          />
                          <span className="font-medium text-white min-w-[12rem]">{team.team.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right min-w-[4rem]">
                            <div className="text-lg font-bold text-white">{team.points}</div>
                            <div className="text-xs text-gray-400">pts</div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {team.form.split('').slice(-5).map((result, index) => (
                              <div key={index} className="relative group">
                                {getFormIcon(result)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-400">Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-400">Europa League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Relegation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
