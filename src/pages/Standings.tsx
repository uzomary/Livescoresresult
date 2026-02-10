import { useParams, useNavigate } from 'react-router-dom';
import { useLeagueStandings } from '@/hooks/useLeague';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Radio, Clock, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { footballApi } from '@/services/footballApi';
import { transformFixtures } from '@/utils/fixtureTransform';
import { useEffect, useState } from 'react';
import MetaTags from '@/components/MetaTags';

// Function to get team abbreviation from full name
const getTeamAbbreviation = (teamName: string): string => {
  if (!teamName) return '';
  
  // Common team abbreviations
  const commonAbbreviations: {[key: string]: string} = {
    'manchester united': 'MUN',
    'manchester city': 'MCI',
    'liverpool': 'LIV',
    'chelsea': 'CHE',
    'arsenal': 'ARS',
    'tottenham': 'TOT',
    'leicester': 'LEI',
    'west ham': 'WHU',
    'everton': 'EVE',
    'leeds': 'LEE',
    'newcastle': 'NEW',
    'wolves': 'WOL',
    'crystal palace': 'CRY',
    'southampton': 'SOU',
    'brighton': 'BHA',
    'burnley': 'BUR',
    'fulham': 'FUL',
    'west brom': 'WBA',
    'sheffield united': 'SHU',
    'aston villa': 'AVL'
  };

  const lowerName = teamName.toLowerCase();
  if (commonAbbreviations[lowerName]) {
    return commonAbbreviations[lowerName];
  }

  // If no common abbreviation, create one from the name
  const words = teamName.split(/\s+/);
  if (words.length >= 2) {
    // Take first letter of first two words (e.g., "Real Madrid" -> "RM")
    return words[0].charAt(0).toUpperCase() + 
           (words[1] ? words[1].charAt(0).toUpperCase() : '');
  }
  
  // If single word, take first 3 letters
  return teamName.substring(0, 3).toUpperCase();
};

const Standings = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { data: standings, isLoading, error } = useLeagueStandings(leagueId);


  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="space-y-2">
            {[...Array(20)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300">Error loading standings</h3>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Trophy className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No standings available</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              There are no standings available for this league at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <MetaTags 
        title={`${standings[0]?.team?.name ? standings[0].team.name.split(' ')[0] + ' League' : 'League'} Standings`}
        description={`Current league standings and table. View team positions, points, wins, draws, losses and goal difference with live match indicators.`}
        url={`/standings/${leagueId}`}
      />
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to League
        </Button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold">League Standings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    P
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    W
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    D
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    L
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    GF
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    GA
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    GD
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {standings.map((team) => {
                  
                  return (
                    <tr key={team.team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {team.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 relative">
                            <img className="h-8 w-8 rounded-full" src={team.team.logo} alt={team.team.name} />
                            {team.isLive && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                                <Radio className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {team.team.name}
                              </div>
                              {team.isLive && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  <Radio className="h-3 w-3 mr-1" />
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {team.isLive && team.liveMatch ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>vs {team.liveMatch.opponent} {team.liveMatch.score}</span>
                                  {team.liveMatch.elapsed && (
                                    <span className="text-xs">({team.liveMatch.elapsed}')</span>
                                  )}
                                </div>
                              ) : (
                                getTeamAbbreviation(team.team.name)
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.win}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.draw}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.lose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.goals.for}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {team.all.goals.against}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        team.goalsDiff > 0 ? 'text-green-600 dark:text-green-400' : 
                        team.goalsDiff < 0 ? 'text-red-600 dark:text-red-400' : 
                        'text-gray-500 dark:text-gray-300'
                      }`}>
                        {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;
