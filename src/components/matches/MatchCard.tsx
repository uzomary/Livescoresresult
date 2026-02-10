
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamLogo } from './TeamLogo';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Match } from '@/utils/fixtureTransform';

interface MatchCardProps {
  match: Match;
  onClick?: (matchId: string) => void;
}

const MatchStatusDisplay = ({
  status,
  time,
  minute: elapsedMinute,
  matchDate
}: {
  status: Match['status'];
  time: string;
  minute?: number;
  matchDate?: string;
}) => {
  const statusClasses = "font-semibold text-xs sm:text-sm";

  // Check if match is starting soon (within 10 minutes)
  const isStartingSoon = () => {
    if (status !== 'SCHEDULED' || !matchDate) return false;

    const now = new Date();
    const matchDateTime = new Date(matchDate);
    const timeDiff = matchDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff > 0 && minutesDiff <= 10;
  };

  if (status === 'LIVE') {
    return (
      <div className="flex flex-col items-center justify-center w-12 text-center">
        <span className="text-primary font-bold text-xs sm:text-sm animate-pulse">LIVE</span>
        <span className={`${statusClasses} text-muted-foreground`}>
          {elapsedMinute !== undefined ? `${elapsedMinute}'` : time}
        </span>
      </div>
    );
  }

  if (status === 'SCHEDULED') {
    const startingSoon = isStartingSoon();

    return (
      <div className="w-12 text-center flex flex-col items-center justify-center h-full">
        {startingSoon && (
          <span className="text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-900 px-1 py-0.5 rounded mb-1 animate-pulse">
            SOON
          </span>
        )}
        <span className={`${statusClasses} ${startingSoon ? 'text-orange-500' : 'text-muted-foreground'}`}>
          {time}
        </span>
      </div>
    );
  }

  if (status === '1H' || status === '2H') {
    const displayMinute = elapsedMinute !== undefined ? elapsedMinute : (time.match(/(\d+)/)?.[0] || '0');
    const halfLabel = status === '1H' ? '1st' : '2nd';

    return (
      <div className="flex flex-col items-center justify-center w-12 text-center">
        <span className="text-muted-foreground text-xs">
          {halfLabel}
        </span>
        <span className={`${statusClasses} text-primary`}>
          {displayMinute}'{status === '2H' && '+'}
        </span>
      </div>
    );
  }

  // Handle other statuses like 'HT', 'FT', etc.
  return (
    <div className="w-12 text-center text-muted-foreground flex items-center justify-center h-full">
      <span className={statusClasses}>{status}</span>
    </div>
  );
};

export const MatchCard = ({ match, onClick }: MatchCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(match.id);
    }
  };

  const { toast } = useToast();

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Feature not available',
      description: 'This feature is currently not available.'
    });
  };

  const isMatchFavorite = false; // Favorite functionality disabled

  // Get the scores with extra time and penalty information
  const getScores = () => {
    try {
      // If no score object, return default values
      if (!match.score) {
        return {
          home: '0',
          away: '0',
          hasExtraTime: false,
          isPenalty: false
        };
      }

      const hasExtraTime = match.score?.extratime?.home != null && match.score?.extratime?.away != null;
      const hasFullTime = match.score?.fulltime?.home != null && match.score?.fulltime?.away != null;
      const isPenalty = match?.status ? (match.status === 'PEN' || match.status === 'PENALTY') : false;
      // If we have both full time and extra time scores
      if (hasExtraTime && hasFullTime) {
        return {
          home: match.score.fulltime.home.toString(),
          away: match.score.fulltime.away.toString(),
          hasExtraTime: true,
          isPenalty: isPenalty && match.score.extratime.home === match.score.extratime.away
        };
      }

      // If we only have full time scores
      if (hasFullTime) {
        return {
          home: match.score.fulltime.home.toString(),
          away: match.score.fulltime.away.toString(),
          hasExtraTime: false,
          isPenalty: isPenalty
        };
      }

      // If we have a score object but no scores yet
      if (match.score && typeof match.score === 'object') {
        return {
          home: '0',
          away: '0',
          hasExtraTime: false,
          isPenalty: false
        };
      }
    } catch (error) {
      console.error('Error parsing match scores:', error);
    }

    // Default fallback
    return {
      home: '-',
      away: '-',
      hasExtraTime: false,
      isPenalty: false
    };
  };

  const { home: homeScore, away: awayScore, hasExtraTime, isPenalty } = getScores();
  const showScore = (match.status === 'LIVE' || match.status === 'FINISHED' || match.status === 'FT' || match.status === 'AET' || match.status === 'HT' || match.status === '1H' || match.status === '2H') &&
    homeScore !== '-' && awayScore !== '-';

  // Check if this is a FIFA Club World Cup match and get group/round info
  const leagueName = typeof match.league === 'string' ? match.league : match.league?.name || '';
  const isFifaClubWorldCup = leagueName.includes('FIFA Club World Cup');

  // Extract and format group/round information
  const getRoundInfo = () => {
    if (!match.round) return null;

    // Handle group stage matches (e.g., "Group A", "Group 1")
    const groupMatch = match.round.match(/Group\s+([A-Z0-9]+)/i);
    if (groupMatch) {
      return `Group ${groupMatch[1].toLowerCase()}`;
    }

    // Handle other round formats
    return match.round;
  };

  const navigate = useNavigate();
  const roundInfo = getRoundInfo();
  const showRoundInfo = isFifaClubWorldCup && roundInfo && match.round.match(/Group\s+[A-Z0-9]+/i);





  // Check if the match went to extra time
  const isExtraTimeWin = match.score?.extratime &&
    (match.score.extratime.home !== null || match.score.extratime.away !== null);
  // Determine if home/away team won in extra time
  const homeWonInExtraTime = isExtraTimeWin &&
    match.score?.fulltime?.home === match.score?.fulltime?.away &&
    match.score?.extratime?.home !== null &&
    match.score?.extratime?.home > (match.score?.extratime?.away || 0);

  const awayWonInExtraTime = isExtraTimeWin &&
    match.score?.fulltime?.home === match.score?.fulltime?.away &&
    match.score?.extratime?.away !== null &&
    match.score?.extratime?.away > (match.score?.extratime?.home || 0);



  return (
    <div
      className="group p-2 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 transition-all duration-200 bg-card hover:bg-accent border border-transparent hover:border-border shadow-sm cursor-pointer"
      onClick={handleClick}
    >
      {/* Favorite Button - Hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
          aria-label="Toggle favorite"
        >
          <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all ${isMatchFavorite ? 'fill-amber-400 text-amber-500' : 'opacity-60 group-hover:opacity-100'}`} />
        </Button>
      </div>

      {/* Match Status - Compact on mobile */}
      <div className="flex flex-col items-center w-12 sm:w-20">
        <MatchStatusDisplay
          status={match.status}
          time={match.time}
          minute={match.minute}
          matchDate={match.date}
        />
        {showRoundInfo && (
          <div
            className="hidden sm:block bg-muted text-muted-foreground text-[10px] font-medium px-2 py-1 rounded-sm whitespace-nowrap w-full truncate text-center"
            title="Group info"
          >
            {roundInfo}
          </div>
        )}
      </div>

      {/* Teams - Compact on mobile */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2.5 ml-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <TeamLogo
            teamName={match.homeTeam.name}
            logoUrl={match.homeTeam.logo}
            className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0"
          />
          <span className={`${homeWonInExtraTime ? 'font-bold' : 'font-medium'} text-xs sm:text-[15px] truncate`}>
            {match.homeTeam.name}{homeWonInExtraTime && ' *'}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <TeamLogo
            teamName={match.awayTeam.name}
            logoUrl={match.awayTeam.logo}
            className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0"
          />
          <span className={`${awayWonInExtraTime ? 'font-bold' : 'font-medium'} text-xs sm:text-[15px] truncate`}>
            {match.awayTeam.name}{awayWonInExtraTime && ' *'}
          </span>
        </div>
      </div>

      {/* Score Container */}
      {showScore ? (
        <div className="flex items-center pr-1 sm:pr-3">
          <div className="flex flex-col items-center gap-1 w-8 sm:w-10">
            <div className="relative">
              <div className="relative">
                <span className="font-bold text-xs sm:text-base min-w-[20px] text-center bg-muted/50 rounded px-1 py-0.5"
                  title={hasExtraTime ? 'Full-time score' : 'Final score'}>
                  {homeScore}
                </span>
                {hasExtraTime && (
                  <span className="absolute -top-2 -right-2 text-[8px] bg-yellow-500 text-black rounded-full w-3 h-3 flex items-center justify-center"
                    title={isPenalty ? 'Match decided by penalties' : 'Match went to extra time'}>
                    {isPenalty ? 'PEN' : 'ET'}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <span className="font-bold text-xs sm:text-base min-w-[20px] text-center bg-muted/50 rounded px-1 py-0.5"
                  title={hasExtraTime ? 'Full-time score' : 'Final score'}>
                  {awayScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-8 sm:w-10"></div>
      )}
    </div>
  );
};
