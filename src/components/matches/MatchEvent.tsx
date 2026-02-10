import { Clock, Users, Shirt, Zap, X, Circle } from 'lucide-react';
import { ApiSportsEvent } from '@/lib/api-sports';

// Simple utility function for conditional class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface MatchEventProps {
  event: ApiSportsEvent;
  isLast?: boolean;
  isHomeTeam?: boolean;
}

export const MatchEvent = ({ event, isLast = false, isHomeTeam = false }: MatchEventProps) => {
  const getEventVariant = (type: string, detail: string) => {
    if (type === 'Goal' || detail.includes('Goal')) return 'goal';
    if (type === 'Card' || detail.includes('Card')) {
      return detail.includes('Red') ? 'red-card' : 'yellow-card';
    }
    if (type === 'subst') return 'substitution';
    if (detail.includes('Missed')) return 'missed';
    if (detail.includes('Penalty') || detail.includes('VAR')) return 'var';
    return 'default';
  };

  const variant = getEventVariant(event.type, event.detail);

  const eventIcons = {
    goal: <Circle className="h-4 w-4 text-green-500" />,
    'yellow-card': <Shirt className="h-4 w-4 text-yellow-500" />,
    'red-card': <Shirt className="h-4 w-4 text-red-500" />,
    'substitution': <Users className="h-4 w-4 text-blue-500" />,
    'missed': <X className="h-4 w-4 text-red-400" />,
    'var': <Zap className="h-4 w-4 text-purple-500" />,
    'default': <Clock className="h-4 w-4 text-gray-400" />
  };

  const eventLabels = {
    'goal': 'GOAL',
    'yellow-card': 'YELLOW CARD',
    'red-card': 'RED CARD',
    'substitution': 'SUBSTITUTION',
    'missed': 'MISSED PENALTY',
    'var': event.detail.includes('Penalty') ? 'PENALTY' : 'VAR DECISION',
    'default': event.detail.toUpperCase()
  };

  const teamNameMap: Record<string, string> = {
    'Manchester United': 'Man Utd',
    'Manchester City': 'Man City',
    'Tottenham Hotspur': 'Tottenham',
    'Nottingham Forest': 'Nott\'m Forest',
    'Wolverhampton Wanderers': 'Wolves',
    'Brighton and Hove Albion': 'Brighton',
    'Newcastle United': 'Newcastle',
    'West Ham United': 'West Ham',
    'Sheffield United': 'Sheffield Utd',
    'Luton Town': 'Luton',
  };

  const getTeamName = (name: string) => teamNameMap[name] || name;

  return (
    <div className={cn(
      "relative px-4 py-3 hover:bg-muted/50 transition-colors group",
      !isLast && "border-b border-border/50"
    )}>
      <div className={cn(
        "flex items-center gap-3",
        isHomeTeam ? "flex-row" : "flex-row-reverse text-right"
      )}>
        {/* Team indicator */}
        <div className={cn(
          "absolute top-0 bottom-0 w-1",
          isHomeTeam ? "left-0 bg-blue-500" : "right-0 bg-red-500"
        )} />
        {/* Time */}
        <div className={cn(
          "w-10 flex-shrink-0 text-sm font-medium",
          isHomeTeam ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
        )}>
          {event.time.elapsed}'
          {event.time.extra && `+${event.time.extra}`}
        </div>
        
        {/* Event Icon with background */}
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border-2",
        //   {
        //     'border-blue-500': isHomeTeam,
        //     'border-red-500': !isHomeTeam,
        //     'bg-green-100 dark:bg-green-900/30': variant === 'goal',
        //     'bg-yellow-100 dark:bg-yellow-900/30': variant === 'yellow-card',
        //     'bg-red-100 dark:bg-red-900/30': variant === 'red-card' || variant === 'missed',
        //     'bg-blue-100 dark:bg-blue-900/30': variant === 'substitution',
        //     'bg-purple-100 dark:bg-purple-900/30': variant === 'var',
        //     'bg-gray-100 dark:bg-gray-800': variant === 'default',
        //   }
        )}>
          {eventIcons[variant]}
        </div>
        
        {/* Event Details */}
        <div className={cn(
          "min-w-0 flex-1",
          !isHomeTeam && "flex flex-col items-end"
        )}>
          <p className={cn(
            "text-sm font-medium truncate",
            isHomeTeam ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
          )}>
            {event.player?.name || 'Unknown Player'}
          </p>
          {event.team?.name && (
            <p className="text-xs text-muted-foreground truncate">
              {getTeamName(event.team.name)}
            </p>
          )}
        </div>
        
        {/* Event Type Badge */}
        <div className={cn(
          "px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ml-2 border",
        //   {
        //     'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-300': variant === 'goal',
        //     'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-300': variant === 'yellow-card',
        //     'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300': variant === 'red-card',
        //     'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300': variant === 'substitution',
        //     'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800/50 dark:text-purple-300': variant === 'var',
        //     'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-300': variant === 'missed' || variant === 'default',
        //   }
        )}>
          {eventLabels[variant]}
        </div>
      </div>
    </div>
  );
};
