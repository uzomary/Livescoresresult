
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ApiSportsMatchStats } from '@/lib/api-sports';

interface MatchStatsProps {
  matchStats: ApiSportsMatchStats[];
}

// List of stat types that should be displayed as percentages
const PERCENTAGE_STATS = [
  'Ball Possession',
  'Pass Accuracy',
  'Shot Accuracy',
  'Tackle Success',
  'Aerial Duels Won',
  'Dribble Success',
  'Duel Success',
  'Long Balls %'
];

export const MatchStats = ({ matchStats }: MatchStatsProps) => {
  if (matchStats.length !== 2) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">Match statistics not available</p>
        </CardContent>
      </Card>
    );
  }

  const [homeStats, awayStats] = matchStats;

  const getStatValue = (stat: string | number | null): number => {
    if (stat === null) return 0;
    if (typeof stat === 'string') {
      // Handle percentage strings like "60%"
      if (stat.includes('%')) {
        return parseFloat(stat.replace('%', ''));
      }
      // Handle other string numbers
      return parseFloat(stat) || 0;
    }
    return stat;
  };

  const renderStat = (label: string, homeStat: any, awayStat: any) => {
    const homeValue = getStatValue(homeStat?.value);
    const awayValue = getStatValue(awayStat?.value);
    const total = homeValue + awayValue || 1; // Prevent division by zero
    const homePercent = (homeValue / total) * 100;
    const awayPercent = (awayValue / total) * 100;
    const isPercentageStat = PERCENTAGE_STATS.some(stat => label.includes(stat));
    
    // Determine which side has higher value for coloring
    const homeIsHigher = homeValue > awayValue;
    const valuesEqual = homeValue === awayValue;

    // Format values based on stat type
    const formatValue = (value: number) => 
      isPercentageStat ? `${Math.round(value)}%` : Math.round(value).toString();

    return (
      <div key={label} className="space-y-2">
        {/* Main stat row */}
        <div className="flex justify-between items-center px-4">
          <span className="font-medium w-16 text-right pr-2">
            {formatValue(homeValue)}
          </span>
          <span className="text-sm text-center flex-1 px-2 truncate">
            {label}
          </span>
          <span className="font-medium w-16 text-left pl-2">
            {formatValue(awayValue)}
          </span>
        </div>
        
        {/* Progress bar row */}
        <div className="flex items-center px-4 gap-1">
          {/* Home team progress */}
          <div className="flex-1 flex">
            <div 
              className={`h-2 rounded-l-full ${homeIsHigher ? 'bg-primary' : 'bg-gray-400'}`}
              style={{ width: `${homePercent}%` }}
            />
            <div className="h-2 bg-gray-200 flex-1" />
          </div>
          
          {/* Middle divider */}
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          {/* Away team progress */}
          <div className="flex-1 flex">
            <div className="h-2 bg-gray-200 flex-1" />
            <div 
              className={`h-2 rounded-r-full ${!homeIsHigher && !valuesEqual ? 'bg-primary' : 'bg-gray-400'}`}
              style={{ width: `${awayPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Get common stats
  const commonStats = homeStats.statistics.filter(homeStat => {
    const awayStat = awayStats.statistics.find(awayStat => awayStat.type === homeStat.type);
    return !!awayStat;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Match Statistics</CardTitle>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{homeStats.team.name}</span>
          <span>{awayStats.team.name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {commonStats.map(homeStat => {
          const awayStat = awayStats.statistics.find(s => s.type === homeStat.type);
          if (!awayStat) return null;
          
          return renderStat(homeStat.type, homeStat, awayStat);
        })}
      </CardContent>
    </Card>
  );
};
