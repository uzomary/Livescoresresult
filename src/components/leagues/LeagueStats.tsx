import { useQuery } from '@tanstack/react-query';
import { fetchPlayersByTeam } from '@/lib/api-sports';
import { fetchTeamsByLeague } from '@/lib/api-sports';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PlayerStats {
  id: number;
  name: string;
  team: string;
  teamLogo: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  photo: string;
}

interface LeagueStatsProps {
  leagueId: number;
  season: number;
}

export function LeagueStats({ leagueId, season }: LeagueStatsProps) {
  // Fetch all teams in the league
  const { data: teams, isLoading: isLoadingTeams, error: teamsError } = useQuery({
    queryKey: ['teams', leagueId, season],
    queryFn: () => fetchTeamsByLeague(leagueId, season),
    enabled: !!leagueId && !!season,
  });

  // Fetch players for each team and process their stats
  const { data: playerStats, isLoading: isLoadingPlayers, error: playersError } = useQuery<PlayerStats[]>({
    queryKey: ['playerStats', leagueId, season],
    queryFn: async () => {
      if (!teams) return [];

      // Fetch players for all teams and process their stats
      const allPlayers = await Promise.all(
        teams.map(team =>
          fetchPlayersByTeam(team.team.id, season).then(players =>
            players.map(player => ({
              id: player.player.id,
              name: player.player.name,
              team: team.team.name,
              teamLogo: team.team.logo,
              photo: player.player.photo,
              goals: player.statistics[0]?.goals?.total || 0,
              assists: player.statistics[0]?.goals?.assists || 0,
              yellowCards: player.statistics[0]?.cards?.yellow || 0,
              redCards: (player.statistics[0]?.cards?.red || 0) + (player.statistics[0]?.cards?.yellowred || 0),
            }))
          )
        )
      );

      return allPlayers.flat();
    },
    enabled: !!teams && teams.length > 0,
  });

  if (isLoadingTeams || isLoadingPlayers) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (teamsError || playersError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load statistics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!playerStats || playerStats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No statistics available for this league.
      </div>
    );
  }

  // Sort and get top performers
  const topScorers = [...playerStats]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const topAssists = [...playerStats]
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  const mostYellowCards = [...playerStats]
    .sort((a, b) => b.yellowCards - a.yellowCards)
    .slice(0, 5);

  const mostRedCards = [...playerStats]
    .sort((a, b) => b.redCards - a.redCards)
    .slice(0, 5);

  const StatCard = ({ title, players, statKey, icon }: {
    title: string;
    players: PlayerStats[];
    statKey: keyof Pick<PlayerStats, 'goals' | 'assists' | 'yellowCards' | 'redCards'>;
    icon: React.ReactNode;
  }) => (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-4">{index + 1}.</span>
              <img
                src={player.photo || '/player-placeholder.png'}
                alt={player.name}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/player-placeholder.png';
                }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{player.name}</span>
                <div className="flex items-center gap-1">
                  <img
                    src={player.teamLogo}
                    alt={player.team}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-muted-foreground">{player.team}</span>
                </div>
              </div>
            </div>
            <span className="font-semibold">{player[statKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Top Scorers"
          players={topScorers}
          statKey="goals"
          icon={<span>⚽</span>}
        />
        <StatCard
          title="Top Assists"
          players={topAssists}
          statKey="assists"
          icon={<span>🅰️</span>}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Most Yellow Cards"
          players={mostYellowCards}
          statKey="yellowCards"
          icon={<span>🟨</span>}
        />
        <StatCard
          title="Most Red Cards"
          players={mostRedCards}
          statKey="redCards"
          icon={<span>🟥</span>}
        />
      </div>
    </div>
  );
}
