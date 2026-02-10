
import { ApiFixture } from '@/services/footballApi';

export interface LeagueInfo {
  id: number;
  name: string;
  logo: string;
  country: string;
  flag: string;
  type?: string;
  season?: number;
}

export interface Venue {
  id?: number;
  name: string;
  city: string;
  country?: string;
  capacity?: number;
}

export interface Match {
  id: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    score?: number;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    score?: number;
  };
  status: "LIVE" | "HT" | "FT" | "SCHEDULED" | "1H" | "2H" | "FINISHED" | "AET" | "PEN" | "PENALTY";
  time: string;
  league: LeagueInfo;
  minute?: number;
  date?: string;
  venue?: Venue;
  referee?: string | null;
  round?: string;
  score?: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime?: {
      home: number | null;
      away: number | null;
    };
    penalty?: {
      home: number | null;
      away: number | null;
    };
  };
  odds?: {
    home: string;
    draw: string;
    away: string;
  };
}

const mapStatus = (apiStatus: string): "LIVE" | "HT" | "FT" | "SCHEDULED" => {
  switch (apiStatus) {
    case '1H':
    case '2H':
      return 'LIVE';
    case 'HT':
      return 'HT';
    case 'FT':
      return 'FT';
    case 'NS':
    case 'TBD':
    default:
      return 'SCHEDULED';
  }
};

const formatTime = (date: string, status: string): string => {
  if (status === 'NS' || status === 'TBD') {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  return status;
};

export const transformFixture = (apiFixture: ApiFixture): Match => {
  // Check if this is a FIFA Club World Cup match and override the logo
  const isFifaClubWorldCup = apiFixture.league.name.includes('FIFA Club World Cup');
  const leagueLogo = isFifaClubWorldCup
    ? 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/78.png'
    : apiFixture.league.logo;

  return {
    id: apiFixture.fixture.id.toString(),
    homeTeam: {
      id: apiFixture.teams.home.id,
      name: apiFixture.teams.home.name,
      logo: apiFixture.teams.home.logo,
      score: apiFixture.goals.home ?? undefined
    },
    awayTeam: {
      id: apiFixture.teams.away.id,
      name: apiFixture.teams.away.name,
      logo: apiFixture.teams.away.logo,
      score: apiFixture.goals.away ?? undefined
    },
    status: mapStatus(apiFixture.fixture.status.short),
    time: formatTime(apiFixture.fixture.date, apiFixture.fixture.status.short),
    league: {
      id: apiFixture.league.id,
      name: apiFixture.league.name,
      logo: leagueLogo,
      country: apiFixture.league.country,
      flag: apiFixture.league.flag || '',
      type: 'type' in apiFixture.league ? String(apiFixture.league.type) : 'League',
      season: apiFixture.league.season
    } as LeagueInfo,
    minute: apiFixture.fixture.status.elapsed || undefined,
    date: apiFixture.fixture.date,
    referee: apiFixture.fixture.referee,
    round: apiFixture.league.round || undefined,
    venue: apiFixture.fixture.venue?.name || apiFixture.fixture.venue?.city ? {
      id: apiFixture.fixture.venue?.id || undefined,
      name: apiFixture.fixture.venue?.name || '',
      city: apiFixture.fixture.venue?.city || '',
      country: apiFixture.league.country
    } : undefined,
    score: {
      halftime: {
        home: apiFixture.score?.halftime?.home ?? null,
        away: apiFixture.score?.halftime?.away ?? null
      },
      fulltime: {
        home: apiFixture.goals?.home ?? apiFixture.score?.fulltime?.home ?? null,
        away: apiFixture.goals?.away ?? apiFixture.score?.fulltime?.away ?? null
      },
      extratime: apiFixture.score?.extratime ? {
        home: apiFixture.score.extratime.home ?? null,
        away: apiFixture.score.extratime.away ?? null
      } : undefined
    },
    odds: apiFixture.odds
  };
};

export const transformFixtures = (apiFixtures: ApiFixture[]): Match[] => {
  return apiFixtures.map(transformFixture);
};

export const transformFixtureData = (apiFixtures: ApiFixture[]): Match[] => {
  return transformFixtures(apiFixtures);
};
