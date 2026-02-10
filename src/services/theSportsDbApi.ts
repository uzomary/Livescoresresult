export interface TSDStanding {
  idStanding: string;
  intRank: string;
  idTeam: string;
  strTeam: string;
  strBadge: string;
  idLeague: string;
  strLeague: string;
  strSeason: string;
  strForm: string;
  strDescription: string;
  intPlayed: string;
  intWin: string;
  intLoss: string;
  intDraw: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  dateUpdated: string;
}

export interface TSDEvent {
  idEvent: string;
  idSoccerXML: string;
  idAPIfootball: string;
  strEvent: string;
  strEventAlternate: string;
  strFilename: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strSeason: string;
  strDescriptionEN: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string;
  intRound: string;
  intAwayScore: string;
  intSpectators: string;
  strOfficial: string;
  strTimestamp: string;
  dateEvent: string;
  dateEventLocal: string;
  strTime: string;
  strTimeLocal: string;
  strTVStation: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intScore: string;
  intScoreHalf: string;
  strResult: string;
  strThumb: string;
  strVideo: string;
  strStatus: string;
  strPostponed: string;
  strLocked: string;
}

const API_KEY = '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Mapping of internal slugs to TheSportsDB League IDs
// Using standard TheSportsDB IDs for major leagues
export const LEAGUE_MAPPING: Record<string, string> = {
  // England
  'premier-league': '4328',
  'championship': '4329',
  'league-one': '4396',
  'league-two': '4397',
  // 'fa-cup': '4330', // ID Conflict (Scottish Premier)
  // 'league-cup': '4331', // ID Conflict (Bundesliga)

  // Spain
  'laliga': '4335',
  // 'segunda-division': '4361',
  // 'copa-del-rey': '4336', // ID Conflict (Greek Superleague)

  // Germany
  'bundesliga': '4331',
  // '2-bundesliga': '4332', // ID Conflict (Serie A)

  // Italy
  'serie-a': '4332',
  'serie-b': '4394',

  // France
  'ligue-1': '4334',
  'ligue-2': '4362',

  // Europe
  // 'champions-league': '4480',
  // 'europa-league': '4481',

  // International
  'world-cup': '4429',

  // Other Major Leagues
  'eredivisie': '4337',
  'belgian-pro-league': '4338',
  'greek-superleague': '4336',
  'scottish-premiership': '4330',
  'primeira-liga': '4344',
  'super-lig': '4346', // Turkish Super Lig
};

export const theSportsDbApi = {
  getLeagueId: (slug: string): string | undefined => {
    // Check if any mapping key is part of the slug
    const key = Object.keys(LEAGUE_MAPPING).find(k => slug.includes(k));
    return key ? LEAGUE_MAPPING[key] : undefined;
  },

  getStandings: async (leagueId: string, season: string) => {
    try {
      // TheSportsDB format s=2023-2024
      const response = await fetch(`${BASE_URL}/lookuptable.php?l=${leagueId}&s=${season}`);
      const data = await response.json();
      return Array.isArray(data.table) ? data.table : (data.table ? [data.table] : []);
    } catch (error) {
      console.error('Error fetching standings:', error);
      return [];
    }
  },

  getFixtures: async (leagueId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/eventsnextleague.php?id=${leagueId}`);
      const data = await response.json();
      return Array.isArray(data.events) ? data.events : (data.events ? [data.events] : []);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return [];
    }
  },

  getResults: async (leagueId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/eventspastleague.php?id=${leagueId}`);
      const data = await response.json();
      return Array.isArray(data.events) ? data.events : (data.events ? [data.events] : []);
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  }
};
