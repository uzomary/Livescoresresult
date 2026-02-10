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
    // Convert grid position to pitch coordinates
    const getPlayerPosition = (grid?: string, isAway: boolean = false): { x: number; y: number } => {
        if (!grid || grid === '0:0') {
            return { x: 50, y: 50 };
        }

        const [row, col] = grid.split(':').map(Number);

        // Y-axis positions for rows 1-4 (1 = attack, 4 = defense)
        // Home team: row 1 at top (attacking upward), row 4 at bottom (defending)
        // Away team: row 1 at bottom (attacking downward), row 4 at top (defending)
        const homeYPositions = [10, 30, 50, 70]; // Row 1-4 for home team
        const awayYPositions = [90, 70, 50, 30]; // Row 1-4 for away team (flipped)

        const y = isAway ? awayYPositions[row - 1] || 50 : homeYPositions[row - 1] || 50;

        // X-axis positions for columns 1-5
        const xPositions = [15, 32.5, 50, 67.5, 85];
        const x = xPositions[col - 1] || 50;

        return { x, y };
    };

    const generateRandomRating = () => {
        return (Math.random() * 3 + 6).toFixed(1);
    };

    return (
        <div className="w-full">
            {/* Team Headers */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <img src={homeTeam.logo} className="w-6 h-6 object-contain" alt="" />
                    <h3 className="font-bold text-white">{homeTeam.name}</h3>
                    <span className="ml-auto text-xs text-gray-400 font-bold">{homeTeam.formation}</span>
                </div>
                <div className="flex items-center gap-2">
                    <img src={awayTeam.logo} className="w-6 h-6 object-contain" alt="" />
                    <h3 className="font-bold text-white">{awayTeam.name}</h3>
                    <span className="ml-auto text-xs text-gray-400 font-bold">{awayTeam.formation}</span>
                </div>
            </div>

            {/* Combined Pitch */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg">
                {/* Pitch SVG */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 300 400"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Grass pattern */}
                    <defs>
                        <pattern id="grass-dual" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="15" height="30" fill="#22c55e" opacity="0.3" />
                            <rect x="15" y="0" width="15" height="30" fill="#16a34a" opacity="0.3" />
                        </pattern>
                    </defs>
                    <rect width="300" height="400" fill="url(#grass-dual)" />

                    {/* Pitch lines */}
                    <g stroke="white" strokeWidth="1.5" fill="none" opacity="0.9">
                        <rect x="15" y="15" width="270" height="370" />
                        <line x1="15" y1="200" x2="285" y2="200" />
                        <circle cx="150" cy="200" r="45" />
                        <circle cx="150" cy="200" r="1.5" fill="white" />
                        <rect x="60" y="15" width="180" height="90" />
                        <rect x="60" y="295" width="180" height="90" />
                        <rect x="105" y="15" width="90" height="30" />
                        <rect x="105" y="355" width="90" height="30" />
                        <circle cx="150" cy="70" r="1.5" fill="white" />
                        <circle cx="150" cy="330" r="1.5" fill="white" />
                        <path d="M 105 70 A 45 45 0 0 1 195 70" />
                        <path d="M 105 330 A 45 45 0 0 0 195 330" />
                        <path d="M 15 27 A 12 12 0 0 1 27 15" />
                        <path d="M 273 15 A 12 12 0 0 1 285 27" />
                        <path d="M 285 373 A 12 12 0 0 1 273 385" />
                        <path d="M 27 385 A 12 12 0 0 1 15 373" />
                        <rect x="135" y="8" width="30" height="7" stroke="white" strokeWidth="2" fill="none" />
                        <rect x="135" y="385" width="30" height="7" stroke="white" strokeWidth="2" fill="none" />
                    </g>
                </svg>

                {/* Home Team Players (attacking upward) */}
                {homeTeam.players.map((player, index) => {
                    const position = getPlayerPosition(player.grid, false);
                    const rating = generateRandomRating();

                    return (
                        <div
                            key={`home-${player.name}-${index}`}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                            }}
                        >
                            <div className="relative">
                                <div
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-110 flex items-center justify-center text-white font-bold text-xs md:text-sm relative z-10"
                                    style={{ backgroundColor: homeTeam.color }}
                                >
                                    {player.number || index + 1}
                                </div>

                                <div
                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                                    style={{
                                        backgroundColor: parseFloat(rating) >= 7.5 ? '#22c55e' :
                                            parseFloat(rating) >= 6.5 ? '#f97316' : '#ef4444'
                                    }}
                                >
                                    {rating}
                                </div>
                            </div>

                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                                <div className="font-medium">{player.name}</div>
                                <div className="text-xs text-gray-300">{player.position}</div>
                            </div>
                        </div>
                    );
                })}

                {/* Away Team Players (attacking downward) */}
                {awayTeam.players.map((player, index) => {
                    const position = getPlayerPosition(player.grid, true);
                    const rating = generateRandomRating();

                    return (
                        <div
                            key={`away-${player.name}-${index}`}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                            }}
                        >
                            <div className="relative">
                                <div
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-110 flex items-center justify-center text-black font-bold text-xs md:text-sm relative z-10"
                                    style={{ backgroundColor: awayTeam.color }}
                                >
                                    {player.number || index + 1}
                                </div>

                                <div
                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                                    style={{
                                        backgroundColor: parseFloat(rating) >= 7.5 ? '#22c55e' :
                                            parseFloat(rating) >= 6.5 ? '#f97316' : '#ef4444'
                                    }}
                                >
                                    {rating}
                                </div>
                            </div>

                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                                <div className="font-medium">{player.name}</div>
                                <div className="text-xs text-gray-300">{player.position}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DualTeamPitch;
