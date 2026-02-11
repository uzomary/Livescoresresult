import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Star, ChevronRight, Share2, ArrowLeft, RefreshCw
} from 'lucide-react';

// Components
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FootballPitch from "@/components/FootballPitch";
import DualTeamPitch from "@/components/DualTeamPitch";
import MetaTags from "@/components/MetaTags";
import { Button } from "@/components/ui/button";

// Icons
import PenaltyMissIcon from '@/components/icons/PenaltyMissIcon';
import YellowCardIcon from '@/components/icons/YellowCardIcon';
import RedCardIcon from '@/components/icons/RedCardIcon';
import SubstitutionIcon from '@/components/icons/SubstitutionIcon';
import FootballIcon from '@/components/icons/FootballIcon';
import VarIcon from '@/components/icons/VarIcon';

// Services & Utils
import { footballApi } from "@/services/footballApi";
import { transformFixture } from "@/utils/fixtureTransform";
import {
    transformEvents,
    transformStatistics,
    transformLineups,
    MatchEvent,
    MatchStatistic,
    TeamLineup
} from "@/utils/matchDetailsTransform";
import OddsTabNew from "@/components/match/OddsTabNew";

interface MatchDetailsProps {
    matchId?: string;
    onBack?: () => void;
}

const CircularProgress = ({ value, color, label, subLabel }: { value: number, color: string, label: string, subLabel: string }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={color}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#00141e]">
                    {value.toFixed(0)}%
                </div>
            </div>
            <div className="text-center">
                <div className="text-sm font-bold text-[#00141e]">{label}</div>
                <div className="text-xs text-gray-500">{subLabel}</div>
            </div>
        </div>
    );
};

const MatchDetails = ({ matchId: propMatchId, onBack: propOnBack }: MatchDetailsProps) => {
    const { matchId: paramMatchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    const matchId = propMatchId || paramMatchId;
    const onBack = propOnBack || (() => navigate(-1));

    // State
    const [activeMainTab, setActiveMainTab] = useState("MATCH");
    const [activeSubTab, setActiveSubTab] = useState("SUMMARY");
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllH2H, setShowAllH2H] = useState(false);

    // Form Limits
    const [homeFormLimit, setHomeFormLimit] = useState(5);
    const [awayFormLimit, setAwayFormLimit] = useState(5);

    // Queries
    const { data: fixtureData, isLoading: fixtureLoading, error: fixtureError } = useQuery({
        queryKey: ['fixture', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error("No match ID");
            return await footballApi.getFixtureById(matchId);
        },
        enabled: !!matchId,
        staleTime: (query) => {
            const status = query.state.data?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: Live matches have 0ms staleTime (no cache), Finished: 30 min cache
            return ['1H', '2H', 'HT', 'LIVE', 'ET', 'P'].includes(status) ? 0 : 30 * 60 * 1000;
        },
        refetchInterval: (query) => {
            const status = query.state.data?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: 15 seconds for live matches for smooth updates
            if (['1H', '2H', 'LIVE', 'ET', 'P'].includes(status)) return 15000; // 15 seconds
            if (status === 'HT') return 60000; // 1 min at halftime
            return false; // No auto-refresh for finished/scheduled
        },
        refetchOnWindowFocus: true, // Refetch when switching tabs for immediate updates
    });

    const { data: eventsData } = useQuery({
        queryKey: ['events', matchId],
        queryFn: () => matchId ? footballApi.getFixtureEvents(matchId) : Promise.reject("No ID"),
        enabled: !!fixtureData && !!matchId,
        staleTime: (query) => {
            const status = fixtureData?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: Finished matches cache for 1 hour, Live: 0ms (no cache)
            return ['FT', 'AET', 'PEN'].includes(status || '') ? 60 * 60 * 1000 : 0;
        },
        refetchInterval: (query) => {
            const status = fixtureData?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: 30 seconds for live match events
            return ['1H', '2H', 'HT', 'LIVE', 'ET', 'P'].includes(status || '') ? 30000 : false;
        },
        refetchOnWindowFocus: true,
    });

    const { data: statsData } = useQuery({
        queryKey: ['statistics', matchId],
        queryFn: () => matchId ? footballApi.getFixtureStatistics(matchId) : Promise.reject("No ID"),
        enabled: !!fixtureData && !!matchId,
        staleTime: (query) => {
            const status = fixtureData?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: Finished matches cache for 1 hour, Live: 0ms (no cache)
            return ['FT', 'AET', 'PEN'].includes(status || '') ? 60 * 60 * 1000 : 0;
        },
        refetchInterval: (query) => {
            const status = fixtureData?.response?.[0]?.fixture?.status?.short;
            // REAL-TIME: 30 seconds for live match statistics
            return ['1H', '2H', 'HT', 'LIVE', 'ET', 'P'].includes(status || '') ? 30000 : false;
        },
        refetchOnWindowFocus: true,
    });

    const { data: lineupsData } = useQuery({
        queryKey: ['lineups', matchId],
        queryFn: () => matchId ? footballApi.getFixtureLineups(matchId) : Promise.reject("No ID"),
        enabled: !!fixtureData && !!matchId,
        staleTime: (query) => {
            const status = fixtureData?.response?.[0]?.fixture?.status?.short;
            // Lineups never change after match starts - cache heavily
            return ['FT', 'AET', 'PEN'].includes(status || '') ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Lineups don't change
        refetchInterval: false, // Never auto-refetch lineups
    });

    // Extract team and league IDs from fixture for queries
    const homeTeamId = fixtureData?.response?.[0]?.teams?.home?.id;
    const awayTeamId = fixtureData?.response?.[0]?.teams?.away?.id;
    const leagueId = fixtureData?.response?.[0]?.league?.id;
    const season = fixtureData?.response?.[0]?.league?.season;

    const { data: h2hData } = useQuery({
        queryKey: ['h2h', homeTeamId, awayTeamId],
        queryFn: () => homeTeamId && awayTeamId ? footballApi.getHeadToHead(homeTeamId, awayTeamId) : Promise.reject("No teams"),
        enabled: !!homeTeamId && !!awayTeamId,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours - H2H history never changes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { data: standingsData } = useQuery({
        queryKey: ['standings', leagueId, season],
        queryFn: () => leagueId && season ? footballApi.getLeagueStandings(leagueId, season) : Promise.reject("No league"),
        enabled: !!leagueId && !!season,
        staleTime: 60 * 60 * 1000, // 1 hour - standings don't change frequently
        refetchOnWindowFocus: false,
    });

    const { data: oddsData } = useQuery({
        queryKey: ['odds', matchId],
        queryFn: () => matchId ? footballApi.getFixtureOdds(matchId) : Promise.reject("No ID"),
        enabled: !!matchId,
        staleTime: 30 * 60 * 1000, // 30 minutes - odds don't change that often
        refetchOnWindowFocus: false,
    });

    const { data: homeForm } = useQuery({
        queryKey: ['teamForm', homeTeamId, homeFormLimit],
        queryFn: () => homeTeamId ? footballApi.getTeamLastMatches(homeTeamId, homeFormLimit) : Promise.reject("No home team"),
        enabled: !!homeTeamId,
        staleTime: 60 * 60 * 1000, // 1 hour - team form doesn't change frequently
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { data: awayForm } = useQuery({
        queryKey: ['teamForm', awayTeamId, awayFormLimit],
        queryFn: () => awayTeamId ? footballApi.getTeamLastMatches(awayTeamId, awayFormLimit) : Promise.reject("No away team"),
        enabled: !!awayTeamId,
        staleTime: 60 * 60 * 1000, // 1 hour - team form doesn't change frequently
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    // Data Preparation - After all hooks
    const fixture = fixtureData?.response?.[0];
    const match = fixture ? transformFixture(fixture) : null;
    const events: MatchEvent[] = eventsData?.response ? transformEvents(eventsData.response, fixture?.teams?.home?.id || 0) : [];
    const statistics: MatchStatistic[] = statsData?.response ? transformStatistics(statsData.response) : [];
    const lineups: TeamLineup[] = lineupsData?.response ? transformLineups(lineupsData.response) : [];

    // Extract odds from oddsData
    const odds = oddsData?.response?.[0]?.bookmakers?.[0]?.bets?.find((bet: any) => bet.name === 'Match Winner')?.values;
    const homeOdds = odds?.find((o: any) => o.value === 'Home')?.odd;
    const drawOdds = odds?.find((o: any) => o.value === 'Draw')?.odd;
    const awayOdds = odds?.find((o: any) => o.value === 'Away')?.odd;

    if (fixtureLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-[#ff0046] animate-spin" />
                    <span className="text-[#00141e] font-medium">Loading match details...</span>
                </div>
            </div>
        );
    }

    if (fixtureError || !match) {
        const errorMessage = fixtureError instanceof Error ? fixtureError.message : '';
        const isRateLimit = errorMessage.includes('Rate limit') || errorMessage.includes('Too many requests');
        const isApiError = errorMessage.includes('API') || errorMessage.includes('authentication') || errorMessage.includes('forbidden');

        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-[#00141e]">
                <div className="text-center max-w-md px-2 sm:px-4">
                    <h2 className="text-xl font-bold mb-4">
                        {isRateLimit ? 'Service Temporarily Unavailable' :
                            isApiError ? 'API Service Error' :
                                'Match Not Found'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {isRateLimit ? 'We\'ve reached our API rate limit. Please try again in a few minutes.' :
                            isApiError ? 'There was an issue connecting to the football data service. Please try again later.' :
                                'The requested match could not be found. It may have been removed or the ID is incorrect.'}
                    </p>
                    <Button onClick={onBack} className="bg-[#ff0046] hover:bg-[#d9003d]">Return Home</Button>
                </div>
            </div>
        );
    }

    const getEventIcon = (type: MatchEvent['type']) => {
        switch (type) {
            case 'goal': return <FootballIcon className="w-4 h-4 text-[#00141e]" />;
            case 'penalty_miss': return <PenaltyMissIcon className="w-4 h-4 text-red-500" />;
            case 'yellow': return <YellowCardIcon className="w-3 h-4 text-yellow-400" />;
            case 'red': return <RedCardIcon className="w-3 h-4 text-red-600" />;
            case 'substitution': return <SubstitutionIcon className="w-4 h-4 text-[#ff0046]" />;
            case 'var': return <VarIcon className="w-4 h-4 text-[#00141e]" />;
            default: return null;
        }
    };

    const renderEventContent = (event: MatchEvent) => {
        if (event.type === 'substitution') {
            const playerIn = event.assist;
            const playerOut = event.player;

            // If we have an incoming player (assist), show them bold
            if (playerIn) {
                return (
                    <>
                        <span className="text-sm font-bold text-[#00141e] leading-none">{playerIn}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{playerOut}</span>
                    </>
                );
            }
            // Fallback for missing assist data
            return (
                <>
                    <span className="text-sm font-bold text-[#00141e] leading-none">{playerOut}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{event.detail || event.type}</span>
                </>
            );
        }
        return (
            <>
                <span className="text-sm font-bold text-[#00141e] leading-none">{event.player}</span>
                <span className="text-[10px] text-gray-500 uppercase">
                    {event.type === 'goal' && event.comments ? event.comments : (event.detail || event.type)}
                </span>
            </>
        );
    };

    const getStatusText = (status: string) => {
        if (status === 'FT') return 'FINISHED';
        if (status === 'HT') return 'HALF TIME';
        if (status === 'LIVE' || ['1H', '2H'].includes(status)) return 'LIVE';
        return status;
    }

    // Group events by half
    const firstHalfEvents = events.filter(e => e.minute <= 45);
    const secondHalfEvents = events.filter(e => e.minute > 45);

    return (
        <div className="min-h-screen bg-white text-[#00141e] font-sans selection:bg-[#ff0046] selection:text-white pb-20">
            <MetaTags
                title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                description={`Live score, lineups and stats for ${match.homeTeam.name} vs ${match.awayTeam.name}`}
            />

            {/* Breadcrumb Header */}
            <div className="max-w-4xl mx-auto px-4 sm:px-4 py-4">
                <div className="flex items-center justify-between sm:mx-0">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-[#00141e] transition-colors" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hover:underline">{match.league.country || 'International'}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:underline">{match.league.name}</span>
                        {match.round && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-500">{match.round}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Star
                            className={`w-5 h-5 cursor-pointer transition-colors ${isFavorite ? 'fill-[#ff0046] text-[#ff0046]' : 'text-gray-400 hover:text-[#00141e]'}`}
                            onClick={() => setIsFavorite(!isFavorite)}
                        />
                    </div>
                </div>
            </div>

            {/* Match Header */}
            <div className="max-w-4xl mx-auto px-4 sm:px-4 mb-8">
                <div className="flex items-center justify-between relative py-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-4 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shadow-lg shadow-gray-200 relative group cursor-pointer border border-gray-100">
                            <Star className="w-4 h-4 absolute top-1 left-1 text-gray-300 group-hover:text-[#ff0046] transition-colors" />
                            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-[#00141e] font-bold text-base md:text-lg text-center leading-tight uppercase tracking-wide">{match.homeTeam.name}</h2>
                    </div>

                    {/* Score Board */}
                    <div className="flex flex-col items-center justify-center min-w-[120px] mx-4">
                        <div className="text-gray-500 text-xs font-semibold mb-2">
                            {match.date ? new Date(match.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '') : ''}
                        </div>
                        <div className={`text-5xl md:text-6xl font-bold tracking-tighter mb-1 ${['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PENALTY', 'AET'].includes(match.status || '')
                            ? 'text-[#ff0046]'
                            : 'text-[#00141e]'
                            }`}>
                            {match.status !== 'SCHEDULED' ? `${match.homeTeam.score} - ${match.awayTeam.score}` : '- vs -'}
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${['LIVE', '1H', '2H'].includes(match.status || '')
                            ? 'text-[#ff0046]'
                            : 'text-gray-500'
                            }`}>
                            {['LIVE', '1H', '2H'].includes(match.status || '') ? (
                                <span className="animate-pulse">
                                    {match.minute}'
                                    {match.addedTime && match.addedTime > 0 && (
                                        <span className="text-[#ff0046]">+{match.addedTime}</span>
                                    )}
                                </span>
                            ) : (
                                getStatusText(match.status || 'SCHEDULED')
                            )}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-4 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shadow-lg shadow-gray-200 relative group cursor-pointer border border-gray-100">
                            <Star className="w-4 h-4 absolute top-1 right-1 text-gray-300 group-hover:text-[#ff0046] transition-colors" />
                            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-[#00141e] font-bold text-base md:text-lg text-center leading-tight uppercase tracking-wide">{match.awayTeam.name}</h2>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="max-w-4xl mx-auto px-4 sm:px-4 border-b border-gray-200 mb-6">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar sm:mx-0">
                    {['MATCH', 'REPORT', 'ODDS', 'H2H', 'STANDINGS'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveMainTab(tab)}
                            className={`pb-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeMainTab === tab
                                ? 'text-[#ff0046] border-[#ff0046]'
                                : 'text-gray-500 border-transparent hover:text-[#00141e]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub Navigation */}
            {activeMainTab === 'MATCH' && (
                <div className="max-w-4xl mx-auto px-4 sm:px-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {['SUMMARY', 'STATS', 'LINEUPS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveSubTab(tab)}
                                className={`px-3 sm:px-4 py-1.5 rounded text-xs font-bold tracking-wider transition-colors ${activeSubTab === tab
                                    ? 'bg-[#00141e] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-4">

                {/* Summary Tab */}
                {activeMainTab === 'MATCH' && activeSubTab === 'SUMMARY' && (
                    <div className="space-y-6">

                        {/* 1st Half */}
                        {firstHalfEvents.length > 0 && (
                            <div className="bg-white rounded-lg overflow-hidden sm:mx-0 border border-gray-100 shadow-sm">
                                <div className="bg-[#00141e] px-2 sm:px-4 py-2 text-xs font-bold text-white uppercase tracking-wider flex justify-between items-center">
                                    <span>1ST HALF</span>
                                    <span className="text-white">{match.score?.halftime?.home ?? 0} - {match.score?.halftime?.away ?? 0}</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {firstHalfEvents.map((event, idx) => (
                                        <div key={idx} className="px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors gap-1 sm:gap-0">
                                            {/* Home Event */}
                                            <div className={`flex-1 flex items-center gap-2 sm:gap-3 ${event.team === 'home' ? 'opacity-100' : 'opacity-0'}`}>
                                                <span className="text-xs font-bold text-gray-400 w-6">{event.minute}'</span>
                                                <div className="flex items-center justify-center w-5 h-5">{getEventIcon(event.type)}</div>
                                                <div className="flex flex-col">
                                                    {renderEventContent(event)}
                                                </div>
                                            </div>

                                            {/* Spacer */}
                                            <div className="w-4"></div>

                                            {/* Away Event */}
                                            <div className={`flex-1 flex items-center gap-2 sm:gap-3 justify-start flex-row-reverse text-right ${event.team === 'away' ? 'opacity-100' : 'opacity-0'}`}>
                                                <span className="text-xs font-bold text-gray-400 w-6">{event.minute}'</span>
                                                <div className="flex items-center justify-center w-5 h-5">{getEventIcon(event.type)}</div>
                                                <div className="flex flex-col items-end">
                                                    {renderEventContent(event)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2nd Half */}
                        {secondHalfEvents.length > 0 && (
                            <div className="bg-white rounded-lg overflow-hidden mt-2 sm:mx-0 border border-gray-100 shadow-sm">
                                <div className="bg-[#00141e] px-2 sm:px-4 py-2 text-xs font-bold text-white uppercase tracking-wider flex justify-between items-center">
                                    <span>2ND HALF</span>
                                    <span className="text-white">{match.homeTeam.score} - {match.awayTeam.score}</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {secondHalfEvents.map((event, idx) => (
                                        <div key={idx} className="px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors gap-1 sm:gap-0">
                                            {/* Home Event */}
                                            <div className={`flex-1 flex items-center gap-2 sm:gap-3 ${event.team === 'home' ? 'opacity-100' : 'opacity-0'}`}>
                                                <span className="text-xs font-bold text-gray-400 w-6">{event.minute}'</span>
                                                <div className="flex items-center justify-center w-5 h-5">{getEventIcon(event.type)}</div>
                                                <div className="flex flex-col">
                                                    {renderEventContent(event)}
                                                </div>
                                            </div>

                                            {/* Spacer */}
                                            <div className="w-4"></div>

                                            {/* Away Event */}
                                            <div className={`flex-1 flex items-center gap-2 sm:gap-3 justify-start flex-row-reverse text-right ${event.team === 'away' ? 'opacity-100' : 'opacity-0'}`}>
                                                <span className="text-xs font-bold text-gray-400 w-6">{event.minute}'</span>
                                                <div className="flex items-center justify-center w-5 h-5">{getEventIcon(event.type)}</div>
                                                <div className="flex flex-col items-end">
                                                    {renderEventContent(event)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 1. Odds */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 sm:mx-0">
                            <h3 className="text-[#00141e] font-bold text-lg mb-4">Betting Odds</h3>
                            {homeOdds && drawOdds && awayOdds ? (
                                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Home Win</div>
                                        <div className="bg-gray-100 rounded-lg p-3 text-center transition-colors hover:bg-gray-200 cursor-pointer shadow-sm">
                                            <div className="text-[#00141e] font-bold text-xl">{homeOdds}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Draw</div>
                                        <div className="bg-gray-100 rounded-lg p-3 text-center transition-colors hover:bg-gray-200 cursor-pointer shadow-sm">
                                            <div className="text-[#00141e] font-bold text-xl">{drawOdds}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Away Win</div>
                                        <div className="bg-gray-100 rounded-lg p-3 text-center transition-colors hover:bg-gray-200 cursor-pointer shadow-sm">
                                            <div className="text-[#00141e] font-bold text-xl">{awayOdds}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center">Odds not available for this match</p>
                            )}
                        </div>

                        {/* 2. Winning Probability */}
                        {homeOdds && drawOdds && awayOdds && (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 sm:mx-0">
                                <h3 className="text-[#00141e] font-bold text-lg mb-4">Winning Probability</h3>
                                {(() => {
                                    const homeOdd = parseFloat(homeOdds);
                                    const drawOdd = parseFloat(drawOdds);
                                    const awayOdd = parseFloat(awayOdds);

                                    const homeProb = (1 / homeOdd) * 100;
                                    const drawProb = (1 / drawOdd) * 100;
                                    const awayProb = (1 / awayOdd) * 100;
                                    const total = homeProb + drawProb + awayProb;

                                    const homePercent = (homeProb / total) * 100;
                                    const drawPercent = (drawProb / total) * 100;
                                    const awayPercent = (awayProb / total) * 100;

                                    return (
                                        <div className="flex justify-around items-center py-4">
                                            <CircularProgress
                                                value={homePercent}
                                                color="#ff0046"
                                                label={match.homeTeam.name}
                                                subLabel={homeOdds}
                                            />
                                            <CircularProgress
                                                value={drawPercent}
                                                color="#9ca3af"
                                                label="Draw"
                                                subLabel={drawOdds}
                                            />
                                            <CircularProgress
                                                value={awayPercent}
                                                color="#00141e"
                                                label={match.awayTeam.name}
                                                subLabel={awayOdds}
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 3. Injured/Suspended Players */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 sm:mx-0">
                            <h3 className="text-[#00141e] font-bold text-lg mb-4">Injuries & Suspensions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Home Team */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <img src={match.homeTeam.logo} className="w-5 h-5 object-contain" alt="" />
                                        <h4 className="text-sm font-bold text-[#00141e]">{match.homeTeam.name}</h4>
                                    </div>
                                    <p className="text-gray-400 text-sm text-center py-4">No injuries or suspensions reported</p>
                                </div>

                                {/* Away Team */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <img src={match.awayTeam.logo} className="w-5 h-5 object-contain" alt="" />
                                        <h4 className="text-sm font-bold text-[#00141e]">{match.awayTeam.name}</h4>
                                    </div>
                                    <p className="text-gray-400 text-sm text-center py-4">No injuries or suspensions reported</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Match Information */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 sm:mx-0">
                            <h3 className="text-[#00141e] font-bold text-lg mb-4">Match Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-bold uppercase w-20">REFEREE</span>
                                    <span className="text-[#00141e] font-medium">{match.referee || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-bold uppercase w-20">VENUE</span>
                                    <span className="text-[#00141e] font-medium">{match.venue?.name}, {match.venue?.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-bold uppercase w-20">CAPACITY</span>
                                    <span className="text-[#00141e] font-medium">
                                        {match.venue?.capacity ? match.venue.capacity.toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Team Form */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 sm:mx-0">
                            <h3 className="text-[#00141e] font-bold text-lg mb-4">Form</h3>

                            <div className="space-y-4">
                                {/* Home Team Form */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <img src={match.homeTeam.logo} className="w-6 h-6 object-contain" alt="" />
                                        <span className="text-sm font-bold text-[#00141e] truncate">{match.homeTeam.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {homeForm?.response && homeForm.response.length > 0 ? (
                                            homeForm.response.slice(0, 5).map((fixture: any, idx: number) => {
                                                const subjectTeamId = match.homeTeam.id;
                                                const homeScore = fixture.goals.home;
                                                const awayScore = fixture.goals.away;

                                                let result = 'D';
                                                let badgeClass = 'bg-gray-400';

                                                if (fixture.teams.home.id === subjectTeamId) {
                                                    if (homeScore > awayScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                                    if (homeScore < awayScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                                } else {
                                                    if (awayScore > homeScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                                    if (awayScore < homeScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                                }

                                                return (
                                                    <div key={idx} className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold ${badgeClass}`}>
                                                        {result}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-gray-400 text-sm">No data</span>
                                        )}
                                    </div>
                                </div>

                                {/* Away Team Form */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <img src={match.awayTeam.logo} className="w-6 h-6 object-contain" alt="" />
                                        <span className="text-sm font-bold text-[#00141e] truncate">{match.awayTeam.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {awayForm?.response && awayForm.response.length > 0 ? (
                                            awayForm.response.slice(0, 5).map((fixture: any, idx: number) => {
                                                const subjectTeamId = match.awayTeam.id;
                                                const homeScore = fixture.goals.home;
                                                const awayScore = fixture.goals.away;

                                                let result = 'D';
                                                let badgeClass = 'bg-gray-400';

                                                if (fixture.teams.home.id === subjectTeamId) {
                                                    if (homeScore > awayScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                                    if (homeScore < awayScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                                } else {
                                                    if (awayScore > homeScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                                    if (awayScore < homeScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                                }

                                                return (
                                                    <div key={idx} className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold ${badgeClass}`}>
                                                        {result}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-gray-400 text-sm">No data</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Head-to-Head (3 matches) */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden sm:mx-0">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-[#00141e] font-bold text-lg">Head-to-head matches</h3>
                            </div>

                            {h2hData?.response && h2hData.response.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {[...h2hData.response]
                                        .sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
                                        .slice(0, 3)
                                        .map((fixture: any) => {
                                            const date = new Date(fixture.fixture.date);
                                            const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.`;
                                            const homeTeam = fixture.teams.home;
                                            const awayTeam = fixture.teams.away;
                                            const homeScore = fixture.goals.home;
                                            const awayScore = fixture.goals.away;

                                            const homeWinner = homeScore > awayScore;
                                            const awayWinner = awayScore > homeScore;

                                            return (
                                                <div key={fixture.fixture.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                                                    <div className="w-12 text-sm text-gray-500 font-bold">
                                                        {dateStr}
                                                    </div>

                                                    <div className="flex-1 flex flex-col gap-1.5 justify-center">
                                                        <div className="flex items-center justify-between pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <img src={homeTeam.logo} alt={homeTeam.name} className="w-4 h-4 object-contain" />
                                                                <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${homeWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                    {homeTeam.name}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm ${homeWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                                {homeScore}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <img src={awayTeam.logo} alt={awayTeam.name} className="w-4 h-4 object-contain" />
                                                                <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${awayWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                    {awayTeam.name}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm ${awayWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                                {awayScore}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    No previous encounters found
                                </div>
                            )}
                        </div>

                        {/* 7. League Standings (2 teams only) */}
                        {standingsData?.response && standingsData.response.length > 0 && (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden sm:mx-0">
                                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                                    <h3 className="text-[#00141e] font-bold text-lg">{match.league.name} Standings</h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                <th className="text-center p-3 w-10">#</th>
                                                <th className="text-left p-3">Team</th>
                                                <th className="text-center p-3 w-12">MP</th>
                                                <th className="text-center p-3 w-16">G</th>
                                                <th className="text-center p-3 w-12">PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {standingsData.response
                                                .filter((team: any) => team.team.id === match.homeTeam.id || team.team.id === match.awayTeam.id)
                                                .map((team: any) => {
                                                    const isHomeTeam = team.team.id === match.homeTeam.id;
                                                    const isAwayTeam = team.team.id === match.awayTeam.id;

                                                    let rankColorClass = 'bg-gray-100 text-gray-600';
                                                    if (team.rank <= 4) rankColorClass = 'bg-[#004682] text-white';
                                                    else if (team.rank === 5) rankColorClass = 'bg-[#bd0000] text-white';
                                                    else if (team.rank === 6) rankColorClass = 'bg-[#dfa400] text-white';

                                                    return (
                                                        <tr key={team.team.id} className="bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                                                            <td className="p-3">
                                                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold mx-auto ${rankColorClass}`}>
                                                                    {team.rank}.
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={team.team.logo} className="w-6 h-6 object-contain" alt="" />
                                                                    <span className="text-base truncate max-w-[140px] sm:max-w-xs text-[#00141e] font-bold">
                                                                        {team.team.name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-center text-sm text-[#00141e]">{team.all.played}</td>
                                                            <td className="p-3 text-center text-sm text-[#00141e]">
                                                                {team.all.goals.for}:{team.all.goals.against}
                                                            </td>
                                                            <td className="p-3 text-center text-base font-bold text-[#00141e]">{team.points}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Tab */}
                {(activeMainTab === 'MATCH' && activeSubTab === 'STATS') && (
                    <div className="space-y-6">
                        <div className="bg-[#00141e] px-2 sm:px-4 py-2 text-xs font-bold text-white uppercase tracking-wider mb-2 rounded">FULL STATISTICS</div>
                        <div className="space-y-6">
                            {statistics.map((stat, idx) => {
                                const total = (typeof stat.home === 'number' ? stat.home : parseInt(stat.home)) + (typeof stat.away === 'number' ? stat.away : parseInt(stat.away));
                                const homePercent = total === 0 ? 0 : ((typeof stat.home === 'number' ? stat.home : parseInt(stat.home)) / total) * 100;

                                return (
                                    <div key={idx} className="group">
                                        <div className="grid grid-cols-3 items-center text-xs font-bold mb-1 px-1">
                                            <span className="text-[#00141e] text-left">{stat.home}</span>
                                            <span className="text-gray-500 uppercase text-center">{stat.label}</span>
                                            <span className="text-[#00141e] text-right">{stat.away}</span>
                                        </div>
                                        <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#ff0046]" style={{ width: `${homePercent}%` }} />
                                            <div className="h-full bg-[#00141e]" style={{ width: `${100 - homePercent}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Lineups Tab */}
                {(activeMainTab === 'MATCH' && activeSubTab === 'LINEUPS') && (
                    <div className="space-y-6">
                        {lineups.length > 0 ? (
                            <div className="space-y-6">
                                {/* Combined Pitch */}
                                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                    <DualTeamPitch
                                        homeTeam={{
                                            name: match.homeTeam.name,
                                            logo: match.homeTeam.logo,
                                            formation: lineups[0].formation,
                                            players: lineups[0].startingXI.map(p => ({
                                                name: p.name,
                                                position: p.position,
                                                number: p.number,
                                                grid: p.grid,
                                            })),
                                            color: '#ff0046'
                                        }}
                                        awayTeam={{
                                            name: match.awayTeam.name,
                                            logo: match.awayTeam.logo,
                                            formation: lineups[1]?.formation || '4-3-3',
                                            players: lineups[1]?.startingXI.map(p => ({
                                                name: p.name,
                                                position: p.position,
                                                number: p.number,
                                                grid: p.grid,
                                            })) || [],
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>

                                {/* Substitutes - Side by Side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Home Substitutes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <img src={match.homeTeam.logo} className="w-5 h-5 object-contain" alt="" />
                                            <div className="bg-[#00141e] px-2 sm:px-4 py-2 text-xs font-bold text-white uppercase tracking-wider flex-1 rounded">
                                                SUBSTITUTES
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1">
                                            {lineups[0].substitutes.map(sub => (
                                                <div key={sub.id} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                                    <span className="w-6 text-xs text-gray-500 font-bold group-hover:text-[#00141e]">{sub.number}</span>
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#00141e]">{sub.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Away Substitutes */}
                                    {lineups[1] && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <img src={match.awayTeam.logo} className="w-5 h-5 object-contain" alt="" />
                                                <div className="bg-[#00141e] px-2 sm:px-4 py-2 text-xs font-bold text-white uppercase tracking-wider flex-1 rounded">
                                                    SUBSTITUTES
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {lineups[1].substitutes.map(sub => (
                                                    <div key={sub.id} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                                        <span className="w-6 text-xs text-gray-500 font-bold group-hover:text-[#00141e]">{sub.number}</span>
                                                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#00141e]">{sub.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 font-bold">Lineups not available</div>
                        )}
                    </div>
                )}

                {/* Player Stats Tab */}
                {(activeMainTab === 'MATCH' && activeSubTab === 'PLAYER STATS') && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-8 text-center">
                            <p className="text-[#00141e] font-bold">Player statistics will be available here</p>
                            <p className="text-gray-500 text-sm mt-2">Individual player performance data</p>
                        </div>
                    </div>
                )}

                {/* Commentary Tab */}
                {(activeMainTab === 'MATCH' && activeSubTab === 'COMMENTARY') && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-8 text-center">
                            <p className="text-[#00141e] font-bold">Match commentary will be available here</p>
                            <p className="text-gray-500 text-sm mt-2">Live text commentary and updates</p>
                        </div>
                    </div>
                )}

                {/* Report Tab */}
                {activeMainTab === 'REPORT' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
                            <h3 className="text-[#00141e] font-bold text-lg mb-4">Match Report</h3>

                            {match.status === 'FT' || match.status === 'FINISHED' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">{match.homeTeam.name}</div>
                                            <div className="text-4xl font-bold text-white">{match.homeTeam.score}</div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <span className="text-gray-500 text-2xl">-</span>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">{match.awayTeam.name}</div>
                                            <div className="text-4xl font-bold text-white">{match.awayTeam.score}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-gray-500">Venue</span>
                                            <span className="text-[#00141e] font-medium">{match.venue?.name}, {match.venue?.city}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-gray-500">Referee</span>
                                            <span className="text-[#00141e] font-medium">{match.referee || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-gray-500">Match Date</span>
                                            <span className="text-[#00141e] font-medium">{new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {events.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-white font-bold mb-3">Key Events</h4>
                                            <div className="space-y-2">
                                                {events.filter(e => e.type === 'goal').map((event, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#00141e] rounded">
                                                        <span className="text-[#ff0046] font-bold text-sm">{event.minute}'</span>
                                                        <span className="text-white">{event.player}</span>
                                                        <span className="text-gray-400 text-sm">({event.team === 'home' ? match.homeTeam.name : match.awayTeam.name})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center">Match report will be available after the match concludes.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Odds Tab */}
                {activeMainTab === 'ODDS' && (
                    <div className="space-y-6">
                        {oddsData?.response && oddsData.response.length > 0 ? (
                            <OddsTabNew data={oddsData} />
                        ) : (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
                                <h3 className="text-[#00141e] font-bold text-lg mb-4">Betting Odds</h3>
                                {match.odds ? (
                                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                                        <div className="bg-[#00141e] rounded-lg p-4 text-center">
                                            <div className="text-gray-400 text-xs mb-2">Home Win</div>
                                            <div className="text-white font-bold text-xl">{match.odds.home}</div>
                                        </div>
                                        <div className="bg-[#00141e] rounded-lg p-4 text-center">
                                            <div className="text-gray-400 text-xs mb-2">Draw</div>
                                            <div className="text-white font-bold text-xl">{match.odds.draw}</div>
                                        </div>
                                        <div className="bg-[#00141e] rounded-lg p-4 text-center">
                                            <div className="text-gray-400 text-xs mb-2">Away Win</div>
                                            <div className="text-white font-bold text-xl">{match.odds.away}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center">Odds not available for this match</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* H2H Tab */}
                {activeMainTab === 'H2H' && (
                    <div className="space-y-6">
                        {/* Mutual H2H */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-[#00141e] font-bold text-lg">Head-to-head matches</h3>
                            </div>

                            {h2hData?.response && h2hData.response.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {[...h2hData.response]
                                        .sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
                                        .slice(0, showAllH2H ? undefined : 5)
                                        .map((fixture: any) => {
                                            const date = new Date(fixture.fixture.date);
                                            const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.`;
                                            const homeTeam = fixture.teams.home;
                                            const awayTeam = fixture.teams.away;
                                            const homeScore = fixture.goals.home;
                                            const awayScore = fixture.goals.away;

                                            const homeWinner = homeScore > awayScore;
                                            const awayWinner = awayScore > homeScore;

                                            return (
                                                <div key={fixture.fixture.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                                                    {/* Date */}
                                                    <div className="w-12 text-sm text-gray-500 font-bold">
                                                        {dateStr}
                                                    </div>

                                                    {/* Teams & Scores */}
                                                    <div className="flex-1 flex flex-col gap-1.5 justify-center">
                                                        {/* Home Team Row */}
                                                        <div className="flex items-center justify-between pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <img src={homeTeam.logo} alt={homeTeam.name} className="w-4 h-4 object-contain" />
                                                                <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${homeWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                    {homeTeam.name}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm ${homeWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                                {homeScore}
                                                            </span>
                                                        </div>

                                                        {/* Away Team Row */}
                                                        <div className="flex items-center justify-between pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <img src={awayTeam.logo} alt={awayTeam.name} className="w-4 h-4 object-contain" />
                                                                <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${awayWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                    {awayTeam.name}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm ${awayWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                                {awayScore}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {h2hData.response.length > 5 && (
                                        <div className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-100" onClick={() => setShowAllH2H(!showAllH2H)}>
                                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 font-medium">
                                                {showAllH2H ? 'Show less matches' : 'Show more matches'}
                                                <ChevronRight className={`w-3 h-3 transition-transform ${showAllH2H ? '-rotate-90' : 'rotate-90'}`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    No previous encounters found
                                </div>
                            )}
                        </div>

                        {/* Home Team Form */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-[#00141e] font-bold text-lg">Last matches: {match.homeTeam.name}</h3>
                            </div>

                            {homeForm?.response && homeForm.response.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {homeForm.response.map((fixture: any) => {
                                        const date = new Date(fixture.fixture.date);
                                        const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.`;

                                        const isHomeTeamSubject = fixture.teams.home.id === match.homeTeam.id;
                                        const subjectTeamId = match.homeTeam.id;

                                        const homeScore = fixture.goals.home;
                                        const awayScore = fixture.goals.away;

                                        // Determine result for the subject team
                                        let result = 'D';
                                        let badgeClass = 'bg-orange-400'; // Draw is Orange/Yellow-ish

                                        if (fixture.teams.home.id === subjectTeamId) {
                                            // Subject is Home
                                            if (homeScore > awayScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                            if (homeScore < awayScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                        } else {
                                            // Subject is Away
                                            if (awayScore > homeScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                            if (awayScore < homeScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                        }

                                        const homeWinner = homeScore > awayScore;
                                        const awayWinner = awayScore > homeScore;

                                        return (
                                            <div key={fixture.fixture.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                                                {/* Date */}
                                                <div className="w-12 text-xs text-gray-500 font-medium">
                                                    {dateStr}
                                                </div>

                                                {/* Teams & Scores */}
                                                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                                                    {/* Home Team Row */}
                                                    <div className="flex items-center justify-between pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-4 h-4 object-contain" />
                                                            <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${homeWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                {fixture.teams.home.name}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm ${homeWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                            {homeScore}
                                                        </span>
                                                    </div>

                                                    {/* Away Team Row */}
                                                    <div className="flex items-center justify-between pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-4 h-4 object-contain" />
                                                            <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${awayWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                {fixture.teams.away.name}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm ${awayWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                            {awayScore}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Form Badge */}
                                                <div className="ml-2">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${badgeClass}`}>
                                                        {result}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="p-3 text-center">
                                        <button
                                            onClick={() => setHomeFormLimit(prev => prev + 5)}
                                            className="text-xs text-gray-500 hover:text-[#00141e] flex items-center justify-center gap-1 mx-auto transition-colors"
                                            disabled={homeForm.response.length < homeFormLimit}
                                        >
                                            {homeForm.response.length < homeFormLimit ? 'No more matches' : 'Show more matches'}
                                            <ChevronRight className="w-3 h-3 rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    No recent matches found
                                </div>
                            )}
                        </div>

                        {/* Away Team Form */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-[#00141e] font-bold text-lg">Last matches: {match.awayTeam.name}</h3>
                            </div>

                            {awayForm?.response && awayForm.response.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {awayForm.response.map((fixture: any) => {
                                        const date = new Date(fixture.fixture.date);
                                        const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.`;

                                        const subjectTeamId = match.awayTeam.id;

                                        const homeScore = fixture.goals.home;
                                        const awayScore = fixture.goals.away;

                                        // Determine result for the subject team
                                        let result = 'D';
                                        let badgeClass = 'bg-orange-400';

                                        if (fixture.teams.home.id === subjectTeamId) {
                                            // Subject is Home
                                            if (homeScore > awayScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                            if (homeScore < awayScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                        } else {
                                            // Subject is Away
                                            if (awayScore > homeScore) { result = 'W'; badgeClass = 'bg-green-600'; }
                                            if (awayScore < homeScore) { result = 'L'; badgeClass = 'bg-red-600'; }
                                        }

                                        const homeWinner = homeScore > awayScore;
                                        const awayWinner = awayScore > homeScore;

                                        return (
                                            <div key={fixture.fixture.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                                                {/* Date */}
                                                <div className="w-12 text-xs text-gray-500 font-medium">
                                                    {dateStr}
                                                </div>

                                                {/* Teams & Scores */}
                                                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                                                    {/* Home Team Row */}
                                                    <div className="flex items-center justify-between pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-4 h-4 object-contain" />
                                                            <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${homeWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                {fixture.teams.home.name}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm ${homeWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                            {homeScore}
                                                        </span>
                                                    </div>

                                                    {/* Away Team Row */}
                                                    <div className="flex items-center justify-between pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-4 h-4 object-contain" />
                                                            <span className={`text-sm truncate max-w-[140px] sm:max-w-xs ${awayWinner ? 'font-bold text-[#00141e]' : 'text-gray-600'}`}>
                                                                {fixture.teams.away.name}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm ${awayWinner ? 'font-bold text-[#00141e]' : 'text-[#00141e]'}`}>
                                                            {awayScore}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Form Badge */}
                                                <div className="ml-2">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${badgeClass}`}>
                                                        {result}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="p-3 text-center">
                                        <button
                                            onClick={() => setAwayFormLimit(prev => prev + 5)}
                                            className="text-xs text-gray-500 hover:text-[#00141e] flex items-center justify-center gap-1 mx-auto transition-colors"
                                            disabled={awayForm.response.length < awayFormLimit}
                                        >
                                            {awayForm.response.length < awayFormLimit ? 'No more matches' : 'Show more matches'}
                                            <ChevronRight className="w-3 h-3 rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    No recent matches found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Standings Tab */}
                {activeMainTab === 'STANDINGS' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="text-[#00141e] font-bold text-lg">{match.league.name} Standings</h3>
                            </div>

                            {standingsData?.response && standingsData.response.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                <th className="text-center p-3 w-10">#</th>
                                                <th className="text-left p-3">Team</th>
                                                <th className="text-center p-3 w-12">MP</th>
                                                <th className="text-center p-3 w-16">G</th>
                                                <th className="text-center p-3 w-12">PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {standingsData.response.map((team: any, idx: number) => {
                                                const isHomeTeam = team.team.id === match.homeTeam.id;
                                                const isAwayTeam = team.team.id === match.awayTeam.id;
                                                const highlightClass = isHomeTeam || isAwayTeam ? 'bg-blue-50/50' : '';

                                                let rankColorClass = 'bg-gray-100 text-gray-600'; // Default
                                                if (team.rank <= 4) rankColorClass = 'bg-[#004682] text-white'; // Champions League (Blue)
                                                else if (team.rank === 5) rankColorClass = 'bg-[#bd0000] text-white'; // Europa League (Red)
                                                else if (team.rank === 6) rankColorClass = 'bg-[#dfa400] text-white'; // Conference League (Yellow/Gold)

                                                return (
                                                    <tr key={team.team.id} className={`hover:bg-gray-50 transition-colors ${highlightClass}`}>
                                                        <td className="p-3">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold mx-auto ${rankColorClass}`}>
                                                                {team.rank}.
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <img src={team.team.logo} className="w-6 h-6 object-contain" alt="" />
                                                                <span className={`text-base truncate max-w-[140px] sm:max-w-xs ${isHomeTeam || isAwayTeam ? 'text-[#00141e] font-bold' : 'text-[#00141e]'}`}>
                                                                    {team.team.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center text-[#00141e] font-medium">{team.all.played}</td>
                                                        <td className="p-3 text-center text-gray-600 font-medium">
                                                            {team.all.goals.for}:{team.all.goals.against}
                                                        </td>
                                                        <td className="p-3 text-center text-[#00141e] font-bold">{team.points}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    <p>Standings not available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-12 text-xs text-gray-600 pb-8">
                Livescoreresults. All rights reserved.
            </div>
        </div>
    );
};

export default MatchDetails;
