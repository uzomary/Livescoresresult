
import { ApiEvent, ApiStatistic, ApiLineup, ApiInjury } from '@/services/footballApi';

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'var' | 'penalty_miss';
  player: string;
  playerId?: number;
  team: 'home' | 'away';
  detail: string;
  assist?: string;
  comments?: string;
}

export interface MatchStatistic {
  label: string;
  home: number;
  away: number;
}

export interface PlayerLineup {
  id: number;
  name: string;
  number: number;
  position: string;
  grid: string;
}

export interface TeamLineup {
  teamId: number;
  teamName: string;
  teamLogo: string;
  formation: string;
  startingXI: PlayerLineup[];
  substitutes: PlayerLineup[];
  coach: {
    name: string;
    photo: string;
  };
}

export interface MatchInjury {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  teamId: number;
  type: string;
  reason: string;
}

const mapEventType = (type: string, detail: string): MatchEvent['type'] => {
  const lowerType = type.toLowerCase();
  const lowerDetail = detail.toLowerCase();

  // Check for penalty miss/save in various formats
  const isPenaltyMiss = [
    'penalty missed',
    'penalty saved',
    'missed penalty',
    'saved penalty',
    'penalty not scored'
  ].some(term => lowerDetail.includes(term));

  if (isPenaltyMiss) {
    // console.log('Penalty miss detected:', { type, detail });
    return 'penalty_miss';
  }

  switch (lowerType) {
    case 'goal':
      return 'goal';
    case 'card':
      return lowerDetail.includes('red') ? 'red' : 'yellow';
    case 'subst':
      return 'substitution';
    case 'var':
      return 'var';
    case 'penalty':
      // If it's a penalty but not a miss, it's a goal
      return 'goal';
    default:
      // console.log('Unknown event type, defaulting to yellow:', { type, detail });
      return 'yellow';
  }
};

export const transformEvents = (events: ApiEvent[], homeTeamId: number): MatchEvent[] => {

  const transformed = events
    .filter(event => event.player?.name) // Filter out events without player names
    .map(event => {
      const eventType = mapEventType(event.type, event.detail);
      // console.log('Processing event:', {
      //   type: event.type,
      //   detail: event.detail,
      //   mappedType: eventType,
      //   player: event.player?.name
      // });

      return {
        minute: event.time.elapsed,
        type: eventType,
        player: event.player.name || 'Unknown Player',
        playerId: event.player.id || undefined,
        team: event.team.id === homeTeamId ? 'home' as const : 'away' as const,
        detail: event.detail,
        assist: event.assist?.name || undefined,
        comments: event.comments || undefined
      };
    })
    .sort((a, b) => a.minute - b.minute);

  // console.log('Transformed events:', transformed);
  return transformed;
};

export const transformStatistics = (statistics: ApiStatistic[]): MatchStatistic[] => {
  if (statistics.length !== 2) return [];

  const homeStats = statistics[0].statistics;
  const awayStats = statistics[1].statistics;

  const statMap: { [key: string]: string } = {
    'Ball Possession': 'Possession',
    'Total Shots': 'Shots',
    'Shots on Goal': 'Shots on Target',
    'Corner Kicks': 'Corners',
    'Passes %': 'Pass Accuracy',
    'Fouls': 'Fouls'
  };

  const result: MatchStatistic[] = [];

  homeStats.forEach((homeStat, index) => {
    const awayStat = awayStats[index];
    if (!awayStat) return;

    const label = statMap[homeStat.type] || homeStat.type;

    if (homeStat.value !== null && awayStat.value !== null) {
      let homeValue = typeof homeStat.value === 'string' ?
        parseInt(homeStat.value.replace('%', '')) : homeStat.value;
      let awayValue = typeof awayStat.value === 'string' ?
        parseInt(awayStat.value.replace('%', '')) : awayStat.value;

      if (!isNaN(homeValue) && !isNaN(awayValue)) {
        result.push({
          label,
          home: homeValue,
          away: awayValue
        });
      }
    }
  });

  return result;
};

export const transformLineups = (lineups: ApiLineup[]): TeamLineup[] => {
  return lineups.map(lineup => ({
    teamId: lineup.team.id,
    teamName: lineup.team.name,
    teamLogo: lineup.team.logo,
    formation: lineup.formation || '4-3-3', // Default formation if not provided
    startingXI: (lineup.startXI || []).map(player => ({
      id: player.player?.id || 0,
      name: player.player?.name || 'Unknown Player',
      number: player.player?.number || 0,
      position: player.player?.pos || 'N/A',
      grid: player.player?.grid || '0:0' // Default grid position if not provided
    })),
    substitutes: (lineup.substitutes || []).map(player => ({
      id: player.player?.id || 0,
      name: player.player?.name || 'Unknown Player',
      number: player.player?.number || 0,
      position: player.player?.pos || 'N/A',
      grid: player.player?.grid || '0:0' // Default grid position if not provided
    })),
    coach: {
      name: lineup.coach?.name || 'Unknown Coach',
      photo: lineup.coach?.photo || ''
    }
  }));
};

export const transformInjuries = (injuries: ApiInjury[]): MatchInjury[] => {
  return injuries.map(injury => ({
    player: {
      id: injury.player.id,
      name: injury.player.name,
      photo: injury.player.photo
    },
    teamId: injury.team.id,
    type: injury.player.type,
    reason: injury.player.reason
  }));
};
