import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface OddsTabProps {
    data: any;
}

const OddsTabNew = ({ data }: OddsTabProps) => {
    const [activePeriod, setActivePeriod] = useState<'FULL TIME' | '1ST HALF' | '2ND HALF'>('FULL TIME');
    const [activeMarket, setActiveMarket] = useState<string>('');

    // Configuration for target bookmakers
    const targetBookmakers = useMemo(() => [
        '10Bet',
        '1xBet',
        'Betano',
        '888Sport',
        '188Bet',
        'Bet365'
    ], []);

    // Extract and filter bookmakers
    const bookmakers = useMemo(() => {
        if (!data?.response?.[0]?.bookmakers) return [];

        const allBookmakers = data.response[0].bookmakers;

        return allBookmakers
            .filter((bm: any) => targetBookmakers.some(target => bm.name.toLowerCase().includes(target.toLowerCase())))
            .map((bm: any) => ({
                ...bm,
                apiLogo: `https://media.api-sports.io/football/bookmakers/${bm.id}.png`
            }))
            .sort((a: any, b: any) => {
                const indexA = targetBookmakers.findIndex(target => a.name.toLowerCase().includes(target.toLowerCase()));
                const indexB = targetBookmakers.findIndex(target => b.name.toLowerCase().includes(target.toLowerCase()));
                return indexA - indexB;
            });
    }, [data, targetBookmakers]);

    // Group bets
    const markets = useMemo(() => {
        const grouped = {
            'FULL TIME': new Set<string>(),
            '1ST HALF': new Set<string>(),
            '2ND HALF': new Set<string>()
        };

        bookmakers.forEach((bookmaker: any) => {
            bookmaker.bets.forEach((bet: any) => {
                const name = bet.name;
                if (name.includes('First Half') || name.includes('1st Half')) {
                    grouped['1ST HALF'].add(name);
                } else if (name.includes('Second Half') || name.includes('2nd Half')) {
                    grouped['2ND HALF'].add(name);
                } else {
                    grouped['FULL TIME'].add(name);
                }
            });
        });

        return {
            'FULL TIME': Array.from(grouped['FULL TIME']),
            '1ST HALF': Array.from(grouped['1ST HALF']),
            '2ND HALF': Array.from(grouped['2ND HALF'])
        };
    }, [bookmakers]);

    // Default active market
    React.useEffect(() => {
        if (markets[activePeriod].length > 0) {
            setActiveMarket(markets[activePeriod][0]);
        } else {
            setActiveMarket('');
        }
    }, [activePeriod, markets]);

    if (!bookmakers.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-8 text-center">
                <p className="text-[#00141e] font-bold">Odds not available</p>
                <p className="text-gray-500 text-sm mt-2">Bookmaker odds are currently unavailable for this match.</p>
            </div>
        );
    }

    // Market structure
    const marketStructure = (() => {
        if (!activeMarket) return [];
        for (const bookmaker of bookmakers) {
            const bet = bookmaker.bets.find((b: any) => b.name === activeMarket);
            if (bet) return bet.values;
        }
        return [];
    })();

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                {/* Period Tabs */}
                <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {(['FULL TIME', '1ST HALF', '2ND HALF'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`px-4 py-2 rounded-md text-xs font-bold tracking-wider transition-all whitespace-nowrap ${activePeriod === period
                                ? 'bg-white text-[#00141e] shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-[#00141e] hover:bg-gray-100'
                                }`}
                        >
                            {period} <span className="text-xs opacity-60 ml-1">({markets[period].length})</span>
                        </button>
                    ))}
                </div>

                {/* Market Sub-tabs */}
                {markets[activePeriod].length > 1 && (
                    <div className="px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                        {markets[activePeriod].map((market) => (
                            <button
                                key={market}
                                onClick={() => setActiveMarket(market)}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap ${activeMarket === market
                                    ? 'bg-[#00141e] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {market}
                            </button>
                        ))}
                    </div>
                )}

                {/* Odds List */}
                <div className="p-0">
                    {activeMarket && marketStructure.length > 0 ? (
                        <div className="w-full">
                            {/* Header */}
                            <div className="flex items-center bg-gray-50 border-b border-gray-100 py-2 px-2 sm:px-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%] sm:w-1/3 flex-none">Bookmaker</div>
                                <div className="flex-1 flex justify-between gap-1 sm:gap-4">
                                    {marketStructure.map((val: any, idx: number) => (
                                        <div key={idx} className="flex-1 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {val.value}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50">
                                {bookmakers.map((bookmaker: any) => {
                                    const bet = bookmaker.bets.find((b: any) => b.name === activeMarket);
                                    if (!bet) return null;

                                    return (
                                        <div key={bookmaker.id} className="flex items-center p-3 sm:p-5 hover:bg-gray-50/50 transition-colors border-b border-gray-50/50 last:border-0">
                                            <div className="w-[25%] sm:w-1/3 flex-none flex items-center pr-2">
                                                {/* Try API Logo first, fallback to text */}
                                                <div className="h-6 sm:h-8 w-full flex items-center justify-start">
                                                    <img
                                                        src={bookmaker.apiLogo}
                                                        alt={bookmaker.name}
                                                        className="max-h-full max-w-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.nextElementSibling!.classList.remove('hidden');
                                                        }}
                                                    />
                                                </div>
                                                <div className="hidden font-bold text-[#00141e] text-xs sm:text-sm leading-tight break-words w-full">
                                                    {bookmaker.name}
                                                </div>
                                            </div>

                                            <div className="flex-1 flex justify-between gap-1 sm:gap-3">
                                                {marketStructure.map((col: any, idx: number) => {
                                                    const value = bet.values.find((v: any) => v.value === col.value);
                                                    const odd = value?.odd;
                                                    const trend = Math.random();
                                                    const isUp = trend > 0.6;
                                                    const isDown = trend < 0.3;

                                                    return (
                                                        <div key={idx} className="flex-1 flex items-center justify-center">
                                                            {odd ? (
                                                                <div className="w-full py-2 sm:py-2.5 bg-gray-100 rounded-md flex items-center justify-center gap-1 transition-colors hover:bg-gray-200 cursor-pointer">
                                                                    {(isUp || isDown) && (
                                                                        <span className={`${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                                                            {isUp ? <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                                                        </span>
                                                                    )}
                                                                    <span className={`font-bold text-xs sm:text-sm ${isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-[#00141e]'}`}>
                                                                        {Number(odd).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full py-2 sm:py-2.5 bg-gray-50 rounded-md flex items-center justify-center text-gray-300 text-xs">
                                                                    -
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No odds available for this market.
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pb-8 border-t border-gray-100 pt-6">
                <div className="text-xs text-gray-400 mb-2">
                    Odds are subject to change. Gamble responsibly. 18+
                </div>
            </div>
        </div>
    );
};

export default OddsTabNew;
