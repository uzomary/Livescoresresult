import { TeamLogo } from './TeamLogo';
import { Match } from '@/utils/fixtureTransform';
import { cn } from '@/lib/utils';

interface ModernMatchCardProps {
  match: Match;
  onClick?: (matchId: string) => void;
}

const getStatusDisplay = (match: Match) => {
  const { status, time, minute } = match;

  if (status === 'LIVE' || status === '1H' || status === '2H') {
    return {
      text: status === 'LIVE' ? 'LIVE' : `${minute || 0}'`,
      className: 'text-red-500 font-semibold',
      isLive: true
    };
  }

  if (status === 'HT') {
    return {
      text: 'HT',
      className: 'text-orange-500 font-medium',
      isLive: false
    };
  }

  if (status === 'FT' || status === 'FINISHED') {
    return {
      text: 'FT',
      className: 'text-gray-400 font-medium',
      isLive: false
    };
  }

  return {
    text: time,
    className: 'text-gray-400 font-medium',
    isLive: false
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

export const ModernMatchCard = ({ match, onClick }: ModernMatchCardProps) => {
  const statusDisplay = getStatusDisplay(match);
  const scores = getScores(match);
  const showScore = scores.home !== null && scores.away !== null;

  const handleClick = () => {
    onClick?.(match.id);
  };

  return (
    <div
      className="bg-card hover:bg-accent rounded-lg p-4 cursor-pointer transition-colors border border-border hover:border-input"
      onClick={handleClick}
    >
      {/* Match Content */}
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <TeamLogo
              teamName={match.homeTeam.name}
              logoUrl={match.homeTeam.logo}
              className="w-6 h-6 object-contain flex-shrink-0"
            />
            <span className="text-foreground font-medium text-sm truncate">
              {match.homeTeam.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={statusDisplay.className}>
              {statusDisplay.text}
            </span>
            {showScore && (
              <span className="text-foreground font-bold text-lg min-w-[24px] text-center">
                {scores.home}
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <TeamLogo
              teamName={match.awayTeam.name}
              logoUrl={match.awayTeam.logo}
              className="w-6 h-6 object-contain flex-shrink-0"
            />
            <span className="text-white font-medium text-sm truncate">
              {match.awayTeam.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="invisible">
              {statusDisplay.text}
            </span>
            {showScore && (
              <span className="text-foreground font-bold text-lg min-w-[24px] text-center">
                {scores.away}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
