/**
 * Multi-Sport API Service
 * Handles Basketball, Hockey, Handball, Rugby, Baseball, Volleyball
 * Uses the same api-sports.io API key as football
 */

import { Match, LeagueInfo } from '@/utils/fixtureTransform';

const API_KEY: string = import.meta.env.VITE_RAPIDAPI_KEY;

// Sport-specific API base URLs
const SPORT_API_URLS: Record<string, string> = {
    basketball: 'https://v1.basketball.api-sports.io',
    hockey: 'https://v1.hockey.api-sports.io',
    handball: 'https://v1.handball.api-sports.io',
    rugby: 'https://v1.rugby.api-sports.io',
    baseball: 'https://v1.baseball.api-sports.io',
    volleyball: 'https://v1.volleyball.api-sports.io',
};

export type SportType = 'basketball' | 'hockey' | 'handball' | 'rugby' | 'baseball' | 'volleyball';

// In-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key: string): any | null {
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        delete cache[key];
        return null;
    }
    return entry.data;
}

function setCache(key: string, data: any): void {
    cache[key] = { data, timestamp: Date.now() };
}

// Generic API request
async function makeRequest(sport: SportType, endpoint: string, params: Record<string, string>): Promise<any> {
    const baseUrl = SPORT_API_URLS[sport];
    if (!baseUrl) throw new Error(`Unknown sport: ${sport}`);

    const url = new URL(endpoint, baseUrl);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const cacheKey = `${sport}_${url.toString()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await fetch(url.toString(), {
        headers: {
            'x-apisports-key': API_KEY,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 429) {
            console.warn(`[${sport}] Rate limited, returning empty`);
            return { response: [] };
        }
        throw new Error(`[${sport}] API error: ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
}

// ————————————————————————————————————————
// Status mapping per sport
// ————————————————————————————————————————

interface StatusResult {
    status: Match['status'];
    time: string;
    minute?: number;
    isLive: boolean;
}

function mapBasketballStatus(game: any): StatusResult {
    const status = game.status?.short || '';
    const timer = game.status?.timer;

    switch (status) {
        case 'Q1': case 'Q2': case 'Q3': case 'Q4': case 'OT': case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: status,
                minute: timer ? parseInt(timer) : undefined,
                isLive: true,
            };
        case 'FT': case 'AOT': case 'AP':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function mapHockeyStatus(game: any): StatusResult {
    const status = game.status?.short || '';
    const timer = game.status?.timer;

    switch (status) {
        case 'P1': case 'P2': case 'P3': case 'OT': case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: status,
                minute: timer ? parseInt(timer) : undefined,
                isLive: true,
            };
        case 'FT': case 'AOT': case 'AP':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function mapHandballStatus(game: any): StatusResult {
    const status = game.status?.short || '';
    const timer = game.status?.timer;

    switch (status) {
        case '1H': case '2H': case 'ET': case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: status,
                minute: timer ? parseInt(timer) : undefined,
                isLive: true,
            };
        case 'FT': case 'AET': case 'AP':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function mapRugbyStatus(game: any): StatusResult {
    const status = game.status?.short || '';
    const timer = game.status?.timer;

    switch (status) {
        case '1H': case '2H': case 'ET': case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: status,
                minute: timer ? parseInt(timer) : undefined,
                isLive: true,
            };
        case 'FT': case 'AET':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function mapBaseballStatus(game: any): StatusResult {
    const status = game.status?.short || '';
    const inning = game.status?.inning;

    switch (status) {
        case 'IN1': case 'IN2': case 'IN3': case 'IN4': case 'IN5':
        case 'IN6': case 'IN7': case 'IN8': case 'IN9': case 'EI':
        case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: inning ? `Inn ${inning}` : status,
                minute: inning ? parseInt(inning) : undefined,
                isLive: true,
            };
        case 'FT': case 'AEI':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function mapVolleyballStatus(game: any): StatusResult {
    const status = game.status?.short || '';

    switch (status) {
        case 'S1': case 'S2': case 'S3': case 'S4': case 'S5': case 'BT': case 'HT':
            return {
                status: status === 'HT' ? 'HT' : 'LIVE',
                time: status,
                isLive: true,
            };
        case 'FT':
            return { status: 'FT', time: 'FT', isLive: false };
        case 'NS':
            return {
                status: 'SCHEDULED',
                time: formatGameTime(game.date || game.time),
                isLive: false,
            };
        default:
            return { status: 'SCHEDULED', time: status || '--', isLive: false };
    }
}

function getStatusMapper(sport: SportType) {
    switch (sport) {
        case 'basketball': return mapBasketballStatus;
        case 'hockey': return mapHockeyStatus;
        case 'handball': return mapHandballStatus;
        case 'rugby': return mapRugbyStatus;
        case 'baseball': return mapBaseballStatus;
        case 'volleyball': return mapVolleyballStatus;
    }
}

function formatGameTime(dateStr: string): string {
    if (!dateStr) return '--';
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return '--';
    }
}

// ————————————————————————————————————————
// Transform API response → Match[]
// ————————————————————————————————————————

function transformGame(sport: SportType, game: any): Match {
    const mapStatus = getStatusMapper(sport);
    const statusResult = mapStatus(game);

    // API response structure varies slightly by sport but follows same pattern
    const homeTeam = game.teams?.home || {};
    const awayTeam = game.teams?.away || {};
    const league = game.league || {};
    const scores = game.scores || {};

    // Get scores - different sports use different score structures
    let homeScore: number | null = null;
    let awayScore: number | null = null;

    if (sport === 'basketball') {
        homeScore = scores.home?.total ?? null;
        awayScore = scores.away?.total ?? null;
    } else if (sport === 'hockey') {
        homeScore = scores.home ?? null;
        awayScore = scores.away ?? null;
    } else if (sport === 'handball') {
        homeScore = scores.home ?? null;
        awayScore = scores.away ?? null;
    } else if (sport === 'rugby') {
        homeScore = scores.home ?? null;
        awayScore = scores.away ?? null;
    } else if (sport === 'baseball') {
        homeScore = scores.home?.total ?? null;
        awayScore = scores.away?.total ?? null;
    } else if (sport === 'volleyball') {
        homeScore = scores.home ?? null;
        awayScore = scores.away ?? null;
    }

    return {
        id: `${sport}_${game.id}`,
        homeTeam: {
            id: homeTeam.id || 0,
            name: homeTeam.name || 'TBD',
            logo: homeTeam.logo || '',
            score: homeScore ?? undefined,
        },
        awayTeam: {
            id: awayTeam.id || 0,
            name: awayTeam.name || 'TBD',
            logo: awayTeam.logo || '',
            score: awayScore ?? undefined,
        },
        status: statusResult.status,
        time: statusResult.time,
        minute: statusResult.minute,
        date: game.date || game.time || '',
        league: {
            id: league.id || 0,
            name: league.name || 'Unknown League',
            logo: league.logo || '',
            country: league.country?.name || league.country || '',
            flag: league.country?.flag || league.flag || '',
        } as LeagueInfo,
        score: {
            halftime: { home: null, away: null },
            fulltime: {
                home: homeScore,
                away: awayScore,
            },
        },
        // No odds for non-football sports
    };
}

// ————————————————————————————————————————
// Public API
// ————————————————————————————————————————

export const multiSportApi = {
    async getGamesByDate(sport: SportType, date: string): Promise<Match[]> {
        try {
            const data = await makeRequest(sport, '/games', {
                date,
                timezone: 'Africa/Lagos',
            });

            if (!data?.response || !Array.isArray(data.response)) {
                return [];
            }

            return data.response.map((game: any) => transformGame(sport, game));
        } catch (error) {
            console.error(`[${sport}] Failed to fetch games for ${date}:`, error);
            return [];
        }
    },
};
