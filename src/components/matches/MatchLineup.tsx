
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamLineup, MatchEvent, PlayerLineup } from '@/utils/matchDetailsTransform';
import YellowCardIcon from '@/components/icons/YellowCardIcon';
import RedCardIcon from '@/components/icons/RedCardIcon';
import FootballIcon from '@/components/icons/FootballIcon';
import SubstitutionIcon from '@/components/icons/SubstitutionIcon';

interface MatchLineupProps {
  homeLineup: TeamLineup;
  awayLineup: TeamLineup;
  events: MatchEvent[];
  venue?: { name: string | null; city: string | null; } | null;
}

const MatchLineup: React.FC<MatchLineupProps> = ({ homeLineup, awayLineup, events, venue }) => {
  const getPlayerEvents = (playerId: number, playerName: string, team: 'home' | 'away') => {
    return events.filter(e =>
      e.team === team &&
      (e.playerId === playerId || e.player === playerName)
    );
  };

  const renderEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case 'goal':
        return <FootballIcon className="w-3 h-3 text-[#00141e]" />;
      case 'yellow':
        return <YellowCardIcon className="w-3 h-3" />;
      case 'red':
        return <RedCardIcon className="w-3 h-3" />;
      case 'substitution':
        return <SubstitutionIcon className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const PlayerRow = ({
    homePlayer,
    awayPlayer,
    isSub = false
  }: {
    homePlayer?: PlayerLineup;
    awayPlayer?: PlayerLineup;
    isSub?: boolean;
  }) => {
    const homeEvents = homePlayer ? getPlayerEvents(homePlayer.id, homePlayer.name, 'home') : [];
    const awayEvents = awayPlayer ? getPlayerEvents(awayPlayer.id, awayPlayer.name, 'away') : [];

    return (
      <div className="grid grid-cols-2 gap-0 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
        {/* Home Player */}
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 border-r border-gray-100 min-w-0">
          <span className="w-5 sm:w-6 text-[10px] sm:text-xs font-bold text-gray-400 text-center shrink-0">
            {homePlayer?.number}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-sm font-bold text-[#00141e] truncate">
              {homePlayer?.name}
              {homePlayer?.position === 'G' && <span className="ml-1 text-[9px] text-gray-400 font-normal">(G)</span>}
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {homeEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-0.5">
                  {renderEventIcon(event)}
                  {event.type === 'goal' && event.minute && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">{event.minute}'</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Away Player */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 p-1.5 sm:p-2 text-right min-w-0">
          <div className="flex flex-col min-w-0 items-end">
            <span className="text-[11px] sm:text-sm font-bold text-[#00141e] truncate">
              {awayPlayer?.position === 'G' && <span className="mr-1 text-[9px] text-gray-400 font-normal">(G)</span>}
              {awayPlayer?.name}
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5 justify-end">
              {awayEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-0.5">
                  {event.type === 'goal' && event.minute && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">{event.minute}'</span>
                  )}
                  {renderEventIcon(event)}
                </div>
              ))}
            </div>
          </div>
          <span className="w-5 sm:w-6 text-[10px] sm:text-xs font-bold text-gray-400 text-center shrink-0">
            {awayPlayer?.number}
          </span>
        </div>
      </div>
    );
  };

  const maxStartingLen = Math.max(homeLineup.startingXI.length, awayLineup.startingXI.length);
  const maxSubsLen = Math.max(homeLineup.substitutes.length, awayLineup.substitutes.length);

  return (
    <div className="space-y-6">
      {/* Starting XI Section */}
      <div>
        <div className="bg-[#00141e] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider rounded-t-lg mb-0.5">
          STARTING LINEUPS
        </div>
        <Card className="rounded-t-none rounded-b-lg border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 grid grid-cols-2 border-b border-gray-100">
            <div className="p-1.5 sm:p-2 px-2 sm:px-4 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">Formation</span>
              <span className="text-[11px] sm:text-xs font-bold text-[#00141e]">{homeLineup.formation}</span>
            </div>
            <div className="p-1.5 sm:p-2 px-2 sm:px-4 flex items-center justify-between border-l border-gray-100">
              <span className="text-[11px] sm:text-xs font-bold text-[#00141e]">{awayLineup.formation}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">Formation</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: maxStartingLen }).map((_, i) => (
              <PlayerRow
                key={`start-${i}`}
                homePlayer={homeLineup.startingXI[i]}
                awayPlayer={awayLineup.startingXI[i]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Substitutes Section */}
      <div>
        <div className="bg-[#00141e] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider rounded-t-lg mb-0.5">
          SUBSTITUTES
        </div>
        <Card className="rounded-t-none rounded-b-lg border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: maxSubsLen }).map((_, i) => (
              <PlayerRow
                key={`sub-${i}`}
                homePlayer={homeLineup.substitutes[i]}
                awayPlayer={awayLineup.substitutes[i]}
                isSub
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Coaches Section */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-100 flex items-center gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-100">
            <AvatarImage src={homeLineup.coach.photo} />
            <AvatarFallback>{homeLineup.coach.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Coach</div>
            <div className="text-[11px] sm:text-sm font-bold text-[#00141e] truncate">{homeLineup.coach.name}</div>
          </div>
        </div>
        <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-100 flex items-center justify-end gap-2 sm:gap-3 text-right">
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Coach</div>
            <div className="text-[11px] sm:text-sm font-bold text-[#00141e] truncate">{awayLineup.coach.name}</div>
          </div>
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-100">
            <AvatarImage src={awayLineup.coach.photo} />
            <AvatarFallback>{awayLineup.coach.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Venue Section */}
      {venue && (venue.name || venue.city) && (
        <Card className="bg-gray-50/50 border-gray-100 p-3 sm:p-4 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Match Venue</div>
          <div className="text-xs sm:text-sm font-bold text-[#00141e]">
            {venue.name}{venue.city ? `, ${venue.city}` : ''}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MatchLineup;
