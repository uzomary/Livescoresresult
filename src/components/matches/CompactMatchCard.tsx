import { TeamLogo } from './TeamLogo';
import { Match } from '@/utils/fixtureTransform';
import { Star, ChevronRight } from 'lucide-react';
import { LiveTimer } from '@/components/common/LiveTimer';
import { favoritesService } from '@/services/favoritesService';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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



  if (status === 'HT' || status === 'BT') {
    return {
      text: 'HT',
      isLive: true,
      showLiveBadge: false
    };
  }

  if (status === 'ET' || status === 'P') {
    return {
      text: `${minute || 0}'`,
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
  const { toast } = useToast();
  const [isMatchFavorite, setIsMatchFavorite] = useState(favoritesService.isFavorite(match.id));

  useEffect(() => {
    const handleFavoritesUpdate = (e: any) => {
      if (e.detail.matchId === match.id) {
        setIsMatchFavorite(e.detail.isFavorite);
      }
    };
    window.addEventListener('favorites-updated', handleFavoritesUpdate);
    return () => window.removeEventListener('favorites-updated', handleFavoritesUpdate);
  }, [match.id]);

  const statusDisplay = getStatusDisplay(match);
  const scores = getScores(match);
  const showScore = scores.home !== null && scores.away !== null;
  const isClickable = !!onClick;

  const handleClick = () => {
    onClick?.(match.id);
  };

  return (
    <div
      className={`bg-white dark:bg-card transition-all border-b border-gray-100 dark:border-border last:border-b-0 ${isClickable ? 'hover:bg-gray-50 dark:hover:bg-accent/50 cursor-pointer' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Star Icon for Favorites */}
        <button
          className={isMatchFavorite ? "flex-shrink-0 text-yellow-400" : "flex-shrink-0 text-gray-300 hover:text-yellow-400 transition-colors"}
          onClick={(e) => {
            e.stopPropagation();
            const newStatus = favoritesService.toggleFavorite(match.id);
            setIsMatchFavorite(newStatus);
            toast({
              title: newStatus ? 'Added to Favorites' : 'Removed from Favorites',
              description: `${match.homeTeam.name} vs ${match.awayTeam.name}`
            });
          }}
        >
          <Star className={isMatchFavorite ? "w-5 h-5 fill-current" : "w-5 h-5"} />
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
            <span className="text-gray-900 dark:text-foreground text-xs font-semibold truncate">
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
            <span className="text-gray-900 dark:text-foreground text-xs font-semibold truncate">
              {match.awayTeam.name.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {/* Scores Column */}
        {showScore && (
          <div className="flex flex-col items-end justify-center gap-2 -mx-4 sm:px-1 min-w-[24px]">
            <span className="font-bold text-xs text-gray-900 dark:text-foreground leading-none h-4 flex items-center">{scores.home}</span>
            <span className="font-bold text-xs text-gray-900 dark:text-foreground leading-none h-4 flex items-center">{scores.away}</span>
          </div>
        )}

        {/* Live Status / Time */}
        <div className="flex flex-col items-end justify-center min-w-[50px] text-right">
          {statusDisplay.showLiveBadge ? (
            <>
              <span className="text-red-500 font-bold animate-pulse text-[10px] mb-0.5">LIVE</span>
              <div className="text-red-600 font-bold text-xs">
                {status === 'HT' ? 'HT' : <LiveTimer match={match} />}
              </div>
            </>
          ) : (
            <span className={status === 'HT' || status === 'BT' || statusDisplay.text === 'HT' ? "text-red-500 font-bold text-xs" : "text-gray-500 font-medium text-xs"}>
              {statusDisplay.text}
            </span>
          )}
        </div>

        {/* Odds Section - Only shown for football (clickable) cards */}
        {isClickable && (
          match.odds ? (
            <div className="flex flex-col items-center gap-1 pl-2 border-l border-gray-100 dark:border-border ml-2">
              <div className="flex items-center justify-center bg-gray-50 dark:bg-accent/50 rounded px-1.5 py-0.5 min-w-[40px]">
                <span className="text-xs font-bold text-gray-700 dark:text-foreground">{match.odds.home}</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 dark:bg-accent/50 rounded px-1.5 py-0.5 min-w-[40px]">
                <span className="text-xs font-bold text-gray-700 dark:text-foreground">{match.odds.draw}</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 dark:bg-accent/50 rounded px-1.5 py-0.5 min-w-[40px]">
                <span className="text-xs font-bold text-gray-700 dark:text-foreground">{match.odds.away}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 pl-2 border-l border-gray-100 dark:border-border ml-2 opacity-30">
              <div className="min-w-[40px] text-center text-xs text-foreground">-</div>
              <div className="min-w-[40px] text-center text-xs text-foreground">-</div>
              <div className="min-w-[40px] text-center text-xs text-foreground">-</div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
