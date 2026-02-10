import { TeamLogo } from './TeamLogo';
import { Match } from '@/utils/fixtureTransform';
import { Star, ChevronRight } from 'lucide-react';

interface CompactMatchCardProps {
  match: Match;
  onClick?: (matchId: string) => void;
}

const getStatusDisplay = (match: Match) => {
  const { status, time, minute } = match;

  if (status === 'LIVE' || status === '1H' || status === '2H') {
    return {
      text: `${minute || 0}'`,
      isLive: true,
      showLiveBadge: true
    };
  }

  if (status === 'HT') {
    return {
      text: 'HT',
      isLive: true,
      showLiveBadge: true
    };
  }

  if (status === 'FT' || status === 'FINISHED') {
    return {
      text: 'FT',
      isLive: false,
      showLiveBadge: false
    };
  }

  return {
    text: time,
    isLive: false,
    showLiveBadge: false
  };
};

const getScores = (match: Match) => {
  if (!match.score) return { home: null, away: null };

  const hasFullTime = match.score?.fulltime?.home != null && match.score?.fulltime?.away != null;
  if (hasFullTime) {
    return {
      home: match.score.fulltime.home,
      away: match.score.fulltime.away
    };
  }

  return { home: null, away: null };
};

// Extract country code from team name (e.g., "Al Wahda (Uae)" -> "Uae")
const getCountryCode = (teamName: string): string => {
  const match = teamName.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

export const CompactMatchCard = ({ match, onClick }: CompactMatchCardProps) => {
  const statusDisplay = getStatusDisplay(match);
  const scores = getScores(match);
  const showScore = scores.home !== null && scores.away !== null;

  const handleClick = () => {
    onClick?.(match.id);
  };

  return (
    <div
      className="bg-white hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 last:border-b-0"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Star Icon for Favorites */}
        <button
          className="flex-shrink-0 text-gray-300 hover:text-yellow-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to favorites
          }}
        >
          <Star className="w-5 h-5" />
        </button>

        {/* Teams Section */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Home Team */}
          <div className="flex items-center gap-1.5">
            <TeamLogo
              teamName={match.homeTeam.name}
              logoUrl={match.homeTeam.logo}
              className="w-4 h-4 object-contain flex-shrink-0"
            />
            <span className="text-gray-900 text-xs font-semibold truncate">
              {match.homeTeam.name.split('(')[0].trim()}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-1.5">
            <TeamLogo
              teamName={match.awayTeam.name}
              logoUrl={match.awayTeam.logo}
              className="w-4 h-4 object-contain flex-shrink-0"
            />
            <span className="text-gray-900 text-xs font-semibold truncate">
              {match.awayTeam.name.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {/* Live Status / Time */}
        <div className="flex flex-col items-end justify-center min-w-[60px] text-right">
          {statusDisplay.showLiveBadge ? (
            <>
              <span className="text-red-500 font-bold animate-pulse text-xs mb-1">LIVE</span>
              <span className="text-red-600 font-bold">{statusDisplay.text}</span>
            </>
          ) : (
            <span className="text-gray-500 font-medium text-xs">{statusDisplay.text}</span>
          )}
        </div>

        {/* Odds Section - Vertical Display (Visible on valid data) */}
        {match.odds ? (
          <div className="hidden md:flex flex-col items-center gap-1 pl-2 border-l border-gray-100 ml-2">
            <div className="flex items-center justify-center bg-gray-50 rounded px-1.5 py-0.5 min-w-[40px]">
              <span className="text-xs font-bold text-gray-700">{match.odds.home}</span>
            </div>
            <div className="flex items-center justify-center bg-gray-50 rounded px-1.5 py-0.5 min-w-[40px]">
              <span className="text-xs font-bold text-gray-700">{match.odds.draw}</span>
            </div>
            <div className="flex items-center justify-center bg-gray-50 rounded px-1.5 py-0.5 min-w-[40px]">
              <span className="text-xs font-bold text-gray-700">{match.odds.away}</span>
            </div>
          </div>
        ) : (
          /* Placeholder for alignment if needed, or hidden */
          <div className="hidden md:flex flex-col items-center gap-1 pl-2 border-l border-gray-100 ml-2 opacity-30">
            <div className="min-w-[40px] text-center text-xs">-</div>
            <div className="min-w-[40px] text-center text-xs">-</div>
            <div className="min-w-[40px] text-center text-xs">-</div>
          </div>
        )}
      </div>
    </div>
  );
};
