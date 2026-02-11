import React from 'react';

interface Player {
    name: string;
    position: string;
    number?: number;
    grid?: string;
}

interface DualTeamPitchProps {
    homeTeam: {
        name: string;
        logo: string;
        formation: string;
        players: Player[];
        color: string;
    };
    awayTeam: {
        name: string;
        logo: string;
        formation: string;
        players: Player[];
        color: string;
    };
}

const DualTeamPitch = ({ homeTeam, awayTeam }: DualTeamPitchProps) => {

    // Determine how many rows a team's grid data uses
    const getMaxRow = (players: Player[]): number => {
        let maxRow = 1;
        players.forEach(p => {
            if (p.grid && p.grid !== '0:0') {
                const row = parseInt(p.grid.split(':')[0], 10);
                if (row > maxRow) maxRow = row;
            }
        });
        return maxRow;
    };

    // Count players in each row for dynamic X spreading
    const getPlayersPerRow = (players: Player[]): Map<number, number> => {
        const rowCounts = new Map<number, number>();
        players.forEach(p => {
            if (p.grid && p.grid !== '0:0') {
                const row = parseInt(p.grid.split(':')[0], 10);
                rowCounts.set(row, (rowCounts.get(row) || 0) + 1);
            }
        });
        return rowCounts;
    };

    /**
     * Convert grid position (row:col) to pitch coordinates.
     * Home team occupies the TOP half (y: 5% to 47%).
     * Away team occupies the BOTTOM half (y: 53% to 95%).
     */
    const getPlayerPosition = (
        grid: string | undefined,
        isAway: boolean,
        maxRow: number,
        playersPerRow: Map<number, number>
    ): { x: number; y: number } => {
        if (!grid || grid === '0:0') {
            return { x: 50, y: isAway ? 75 : 25 };
        }

        const [row, col] = grid.split(':').map(Number);

        // Y positions - each team gets its own half
        const homeYStart = 5;
        const homeYEnd = 47;
        const awayYStart = 95;
        const awayYEnd = 53;

        let y: number;
        if (maxRow <= 1) {
            y = isAway ? awayYStart : homeYStart;
        } else {
            const fraction = (row - 1) / (maxRow - 1);
            if (isAway) {
                y = awayYStart + fraction * (awayYEnd - awayYStart);
            } else {
                y = homeYStart + fraction * (homeYEnd - homeYStart);
            }
        }

        // X positions - dynamic spreading with padding based on player count
        // Fewer players = more padding = narrower band (closer to center)
        const playersInThisRow = playersPerRow.get(row) || 1;
        let x: number;

        if (playersInThisRow === 1) {
            x = 50;
        } else {
            // Scale padding: 2 players ~30%-70%, 3 ~18%-82%, 4 ~12%-88%, 5+ ~8%-92%
            const padding = playersInThisRow === 2 ? 30
                : playersInThisRow === 3 ? 18
                    : playersInThisRow === 4 ? 12
                        : 8;
            const availableWidth = 100 - 2 * padding;
            x = padding + ((col - 1) / (playersInThisRow - 1)) * availableWidth;
        }

        return { x, y };
    };

    const homeMaxRow = getMaxRow(homeTeam.players);
    const awayMaxRow = getMaxRow(awayTeam.players);
    const homePlayersPerRow = getPlayersPerRow(homeTeam.players);
    const awayPlayersPerRow = getPlayersPerRow(awayTeam.players);

    // Get short name (surname only)
    const getShortName = (name: string) => {
        const parts = name.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : name;
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Home Team Header */}
            <div className="flex items-center justify-between px-1 py-2">
                <div className="flex items-center gap-2">
                    <img src={homeTeam.logo} className="w-5 h-5 object-contain" alt="" />
                    <span className="text-xs font-bold text-[#00141e] uppercase tracking-wide">{homeTeam.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{homeTeam.formation}</span>
            </div>

            {/* Combined Pitch - constrained size */}
            <div className="relative w-full bg-[#4a8c3f] rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '140%' }}>
                <div className="absolute inset-0">
                    {/* Grass stripes */}
                    <div className="absolute inset-0">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full"
                                style={{
                                    top: `${(i / 14) * 100}%`,
                                    height: `${100 / 14}%`,
                                    backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Pitch markings SVG */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 340 476"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none">
                            {/* Outer boundary */}
                            <rect x="20" y="14" width="300" height="448" />

                            {/* Center line */}
                            <line x1="20" y1="238" x2="320" y2="238" />

                            {/* Center circle */}
                            <circle cx="170" cy="238" r="40" />
                            <circle cx="170" cy="238" r="2" fill="rgba(255,255,255,0.5)" />

                            {/* Top 18-yard box */}
                            <rect x="60" y="14" width="220" height="80" />
                            {/* Top 6-yard box */}
                            <rect x="110" y="14" width="120" height="28" />
                            {/* Top penalty spot */}
                            <circle cx="170" cy="64" r="1.5" fill="rgba(255,255,255,0.5)" />
                            {/* Top penalty arc - "D" outside the box */}
                            <path d="M 130 94 A 40 40 0 0 1 210 94" />

                            {/* Bottom 18-yard box */}
                            <rect x="60" y="382" width="220" height="80" />
                            {/* Bottom 6-yard box */}
                            <rect x="110" y="434" width="120" height="28" />
                            {/* Bottom penalty spot */}
                            <circle cx="170" cy="412" r="1.5" fill="rgba(255,255,255,0.5)" />
                            {/* Bottom penalty arc - "D" outside the box */}
                            <path d="M 130 382 A 40 40 0 0 0 210 382" />

                            {/* Goal posts */}
                            <rect x="145" y="6" width="50" height="8" strokeWidth="1.5" />
                            <rect x="145" y="462" width="50" height="8" strokeWidth="1.5" />

                            {/* Corner arcs */}
                            <path d="M 20 22 A 8 8 0 0 1 28 14" />
                            <path d="M 312 14 A 8 8 0 0 1 320 22" />
                            <path d="M 320 454 A 8 8 0 0 1 312 462" />
                            <path d="M 28 462 A 8 8 0 0 1 20 454" />
                        </g>
                    </svg>

                    {/* Home Team Players (top half) */}
                    {homeTeam.players.map((player, index) => {
                        const position = getPlayerPosition(player.grid, false, homeMaxRow, homePlayersPerRow);

                        return (
                            <div
                                key={`home-${player.name}-${index}`}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                style={{
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                }}
                            >
                                <div
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/80 shadow-md flex items-center justify-center text-white font-bold text-[11px] sm:text-xs"
                                    style={{ backgroundColor: homeTeam.color }}
                                >
                                    {player.number || index + 1}
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white font-medium mt-0.5 text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-[60px] truncate">
                                    {getShortName(player.name)}
                                </span>
                            </div>
                        );
                    })}

                    {/* Away Team Players (bottom half) */}
                    {awayTeam.players.map((player, index) => {
                        const position = getPlayerPosition(player.grid, true, awayMaxRow, awayPlayersPerRow);

                        return (
                            <div
                                key={`away-${player.name}-${index}`}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                style={{
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                }}
                            >
                                <div
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-gray-300 shadow-md flex items-center justify-center text-[#00141e] font-bold text-[11px] sm:text-xs"
                                    style={{ backgroundColor: awayTeam.color }}
                                >
                                    {player.number || index + 1}
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white font-medium mt-0.5 text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-[60px] truncate">
                                    {getShortName(player.name)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Away Team Footer */}
            <div className="flex items-center justify-between px-1 py-2">
                <div className="flex items-center gap-2">
                    <img src={awayTeam.logo} className="w-5 h-5 object-contain" alt="" />
                    <span className="text-xs font-bold text-[#00141e] uppercase tracking-wide">{awayTeam.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{awayTeam.formation}</span>
            </div>
        </div>
    );
};

export default DualTeamPitch;
