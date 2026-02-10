import { Match } from '@/utils/fixtureTransform';
import { ApiFixture } from '@/services/footballApi';

export const adaptApiEventToMatch = (
    event: ApiFixture,
    country: string = '',
    leagueName: string = ''
): Match => {
    const fixture = event.fixture;
    const teams = event.teams;
    const goals = event.goals;
    const league = event.league;
    const score = event.score;

    // Map API status to Match status
    const statusMap: Record<string, Match['status']> = {
        'NS': 'SCHEDULED',
        'TBD': 'SCHEDULED',
        '1H': '1H',
        'HT': 'HT',
        '2H': '2H',
        'ET': 'AET',
        'P': 'PEN',
        'FT': 'FT',
        'AET': 'AET',
        'PEN': 'PENALTY',
        'LIVE': 'LIVE',
    };

    const status = statusMap[fixture.status.short] || 'SCHEDULED';

    return {
        id: fixture.id.toString(),
        homeTeam: {
            id: teams.home.id,
            name: teams.home.name,
            logo: teams.home.logo,
            score: goals.home ?? undefined,
        },
        awayTeam: {
            id: teams.away.id,
            name: teams.away.name,
            logo: teams.away.logo,
            score: goals.away ?? undefined,
        },
        status,
        time: new Date(fixture.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
        league: {
            id: league.id,
            name: leagueName || league.name,
            logo: league.logo,
            country: country || league.country || '',
            flag: league.flag || '',
            season: league.season,
        },
        minute: fixture.status.elapsed ?? undefined,
        date: fixture.date,
        venue: event.fixture.venue
            ? {
                id: event.fixture.venue.id ?? undefined,
                name: event.fixture.venue.name || 'Unknown',
                city: event.fixture.venue.city || 'Unknown',
            }
            : undefined,
        referee: fixture.referee,
        round: league.round,
        score: {
            halftime: {
                home: score?.halftime?.home ?? null,
                away: score?.halftime?.away ?? null,
            },
            fulltime: {
                home: score?.fulltime?.home ?? null,
                away: score?.fulltime?.away ?? null,
            },
        },
    };
};
