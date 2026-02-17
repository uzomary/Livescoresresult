const API_URL = import.meta.env.VITE_API_URL || 'https://v3.football.api-sports.io';
const API_KEY: string = import.meta.env.VITE_RAPIDAPI_KEY;

if (!API_KEY) {
  throw new Error('VITE_RAPIDAPI_KEY is not defined in environment variables');
}

const headers = {
  'x-apisports-key': API_KEY,
  'Content-Type': 'application/json'
};

// Cache configuration
export const CACHE_DURATION = {
  FIXTURES: 2 * 60 * 1000, // Reduced to 2 minutes for general fixtures
  LIVE_FIXTURES: 15 * 1000, // Reduced to 15 seconds for live matches
  LEAGUES: 24 * 60 * 60 * 1000,
  STANDINGS: 30 * 60 * 1000,
  ODDS: 60 * 60 * 1000
};

// Rate limiting state
interface RateLimitStatus {
  remaining: number;
  reset: number; // Timestamp when limit resets
  limit: number;
}

class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private rateLimit: RateLimitStatus = {
    remaining: 150000, // Mega Plan (150k/day)
    reset: 0,
    limit: 150000
  };
  private lastRequestTime = 0;
  private minInterval = 75; // ~13.3 req/s, safely below 15 req/s limit

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check if we need to wait for rate limit reset
      const now = Date.now();
      if (this.rateLimit.remaining <= 1 && now < this.rateLimit.reset) {
        const waitTime = this.rateLimit.reset - now + 1000; // Add 1s buffer
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Reset estimated quota after waiting
        this.rateLimit.remaining = this.rateLimit.limit;
      }

      // Ensure minimum interval between requests
      const timeSinceLast = Date.now() - this.lastRequestTime;
      if (timeSinceLast < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLast));
      }

      const requestTask = this.queue.shift();
      if (requestTask) {
        this.lastRequestTime = Date.now();
        // Decrement estimated remaining (will be updated by actual headers)
        this.rateLimit.remaining = Math.max(0, this.rateLimit.remaining - 1);

        try {
          await requestTask();
        } catch (e) {
          console.error("Error processing queued request:", e);
        }
      }
    }

    this.isProcessing = false;
  }

  updateLimits(headers: Headers) {
    const remaining = headers.get('x-ratelimit-requests-remaining');
    const limit = headers.get('x-ratelimit-requests-limit');
    // Some APIs use reset as seconds remaining, others as timestamp. API-Football usually implies day reset.
    // We'll trust 'remaining' most.

    if (remaining) {
      this.rateLimit.remaining = parseInt(remaining, 10);
      console.log(`API Quota Remaining: ${this.rateLimit.remaining}`);
    }
    if (limit) {
      this.rateLimit.limit = parseInt(limit, 10);
    }
  }
}

const apiQueue = new RequestQueue();

// Browser cache helper functions
function getCachedData(key: string) {
  try {
    const cached = localStorage.getItem(`football_cache_${key}`);
    if (!cached) return null;

    const { data, timestamp, duration } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < duration) {
      return data;
    }

    // Remove expired cache
    localStorage.removeItem(`football_cache_${key}`);
    return null;
  } catch {
    return null;
  }
}

function setCachedData(key: string, data: any, duration: number) {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      duration
    };
    localStorage.setItem(`football_cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    // Storage quota exceeded, clear old cache
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('football_cache_'))
        .forEach(k => localStorage.removeItem(k));
    } catch { }
  }
}

// Permanent cache helper functions for odds (never expire)
function getPermanentOddsCache(date: string) {
  try {
    const cached = localStorage.getItem(`livescore_odds_permanent_v2_${date}`);
    if (!cached) return null;

    const { data } = JSON.parse(cached);
    return data;
  } catch {
    return null;
  }
}

function setPermanentOddsCache(date: string, data: any) {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      // No duration - permanent cache
    };
    localStorage.setItem(`livescore_odds_permanent_v2_${date}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to store permanent odds cache:', error);
  }
}


// Enhanced API request function with caching and request queuing
async function makeApiRequestWithCache(endpoint: string, params: Record<string, string> = {}, cacheDuration: number = CACHE_DURATION.FIXTURES) {
  // Sort keys to ensure consistent cache key regardless of param order
  const sortedParams = Object.keys(params).sort().reduce((obj: any, key) => {
    obj[key] = params[key];
    return obj;
  }, {});

  const cacheKey = `${endpoint}_${JSON.stringify(sortedParams)}`;

  // Try cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Queue the network request
  return apiQueue.add(async () => {
    // Double check cache in case a parallel request just finished and cached it
    const doubleCheckCache = getCachedData(cacheKey);
    if (doubleCheckCache) return doubleCheckCache;

    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(normalizedEndpoint, API_URL);

    // Add parameters to URL
    Object.entries(sortedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value as string);
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers,
        cache: 'no-cache',
        method: 'GET'
      });

      // Update rate limits from headers
      apiQueue.updateLimits(response.headers);

      if (!response.ok) {
        // Handle specific errors
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded.`);
        }
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for rate limit errors in body
      if (data.errors && typeof data.errors === 'object') {
        if (data.errors.rateLimit) {
          throw new Error('Rate limit exceeded (body).');
        }
        if (data.errors.token) {
          throw new Error('API authentication failed.');
        }
      }

      // Cache successful response
      setCachedData(cacheKey, data, cacheDuration);

      return data;
    } catch (error) {
      // Return stale cache if available on error
      const staleCache = localStorage.getItem(`football_cache_${cacheKey}`);
      if (staleCache) {
        try {
          const { data } = JSON.parse(staleCache);
          console.warn('API failed, serving stale cache data');
          return data;
        } catch { }
      }
      throw error;
    }
  });
}

// Helper function to handle API requests
async function makeApiRequest(endpoint: string, params: Record<string, string> = {}) {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(normalizedEndpoint, API_URL);

  // Add parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  // API Request

  try {
    const response = await fetch(url.toString(), {
      headers,
      cache: 'no-cache',
      method: 'GET'
    });

    // API Response status

    if (!response.ok) {
      const errorText = await response.text();

      // Handle specific error cases
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      }
      if (response.status === 401) {
        throw new Error(`API authentication failed. Please check your API key.`);
      }
      if (response.status === 403) {
        throw new Error(`API access forbidden. Your subscription may have expired.`);
      }

      // API Error response
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // API Response data
    return data;
  } catch (error) {
    // API Request failed
    throw error;
  }
}

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
      redcard: number | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
      redcard: number | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
  events?: ApiEvent[];
  odds?: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface ApiResponse {
  get: string;
  parameters: any;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: ApiFixture[];
}

export interface ApiEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiStatistic {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: Array<{
    type: string;
    value: string | number | null;
  }>;
}

export interface ApiLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  formation: string;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }>;
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

export interface ApiInjury {
  player: {
    id: number;
    name: string;
    photo: string;
    type: string;
    reason: string;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  league: {
    id: number;
    season: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
  };
}

export interface ApiTeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface ApiLeague {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
    coverage: {
      fixtures: {
        events: boolean;
        lineups: boolean;
        statistics_fixtures: boolean;
        statistics_players: boolean;
      };
      standings: boolean;
      players: boolean;
      top_scorers: boolean;
      top_assists: boolean;
      top_cards: boolean;
      injuries: boolean;
      predictions: boolean;
      odds: boolean;
    };
  }>;
}

export interface TeamStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
  isLive?: boolean; // Indicates if team has a live match
  liveMatch?: {
    fixtureId: number;
    opponent: string;
    status: string;
    elapsed: number | null;
    score: string;
  };
}

export interface ApiStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: TeamStanding[][];
  };
}

// All mock data imports removed - app now uses real API only

export const footballApi = {
  async getTodaysFixtures(): Promise<ApiResponse> {
    const today = new Date().toISOString().split('T')[0];
    // Fetching fixtures for today

    // Use makeApiRequest which adds the /v3 prefix and handles errors
    // For today's fixtures, use very short cache duration
    const data = await makeApiRequestWithCache('/fixtures', {
      date: today,
      timezone: 'Africa/Lagos'
    }, CACHE_DURATION.LIVE_FIXTURES);

    // Successfully fetched fixtures
    return data;
  },

  async getFixtureById(id: string): Promise<ApiResponse> {
    try {
      if (!id) {
        // Error: No fixture ID provided
        throw new Error('No fixture ID provided');
      }

      // Fetching fixture with ID

      // Use makeApiRequest which adds the /v3 prefix and handles errors
      const data = await makeApiRequestWithCache('/fixtures', { id });

      if (!data?.response?.[0]) {
        // No fixture found with ID
        throw new Error('No fixture data in response');
      }

      // Successfully fetched fixture

      // Ensure the response has the correct structure
      return {
        get: "fixtures",
        parameters: { id },
        errors: [],
        results: 1,
        paging: { current: 1, total: 1 },
        response: data.response
      };
    } catch (error) {
      // Check if this is a rate limit or API error that should be propagated
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimitError = errorMessage.includes('Rate limit') || errorMessage.includes('Too many requests');
      const isApiError = errorMessage.includes('API') || errorMessage.includes('authentication') || errorMessage.includes('forbidden');

      // If it's a rate limit or API error, throw it immediately
      if (isRateLimitError || isApiError) {
        throw error;
      }

      // For other errors, throw them
      throw error;
    }
  },

  async getFixtureEvents(fixtureId: string): Promise<{ response: ApiEvent[] }> {
    // Fetching events for fixture
    const data = await makeApiRequestWithCache('/fixtures/events', {
      fixture: fixtureId
    });
    // Successfully fetched events
    return data;
  },

  async getFixtureStatistics(fixtureId: string): Promise<{ response: ApiStatistic[] }> {
    // Fetching statistics for fixture
    const data = await makeApiRequestWithCache('/fixtures/statistics', {
      fixture: fixtureId
    });
    // Successfully fetched statistics
    return data;
  },

  async getFixtureLineups(fixtureId: string): Promise<{ response: ApiLineup[] }> {
    // Fetching lineups for fixture
    const data = await makeApiRequestWithCache('/fixtures/lineups', {
      fixture: fixtureId
    });
    // Successfully fetched lineups
    return data;
  },

  async getFixtureInjuries(fixtureId: string): Promise<{ response: ApiInjury[] }> {
    // Fetching injuries for fixture
    const data = await makeApiRequestWithCache('/injuries', {
      fixture: fixtureId
    }, 0); // Disable cache for injuries
    // Successfully fetched injuries
    return data;
  },

  async searchTeams(query: string): Promise<{ response: ApiTeam[] }> {
    const response = await fetch(`${API_URL}/teams?search=${encodeURIComponent(query)}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to search teams');
    }

    return response.json();
  },

  async getTeamLastMatches(teamId: number, count: number = 5): Promise<ApiResponse> {
    const data = await makeApiRequestWithCache('/fixtures', {
      team: teamId.toString(),
      last: count.toString(),
      status: 'FT-AET-PEN' // Only finished matches
    }, CACHE_DURATION.FIXTURES);

    return data;
  },

  async getTeamFixtures(teamId: number, season: number = 2024): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/fixtures?team=${teamId}&season=${season}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team fixtures');
    }

    return response.json();
  },

  async getLeagues(): Promise<{ response: ApiLeague[] }> {
    // Fetching leagues

    try {
      const data = await makeApiRequestWithCache('/leagues', {}, CACHE_DURATION.LEAGUES);

      if (!data.response || !Array.isArray(data.response)) {
        // Invalid leagues response format
        throw new Error('Invalid leagues data format received from API');
      }

      // Filter out any invalid league entries
      const validLeagues = data.response.filter(league =>
        league?.league?.id && league?.league?.name
      );

      if (validLeagues.length === 0) {
        throw new Error('No valid leagues found in API response');
      }

      // Successfully fetched leagues
      return { response: validLeagues };
    } catch (error) {
      // Failed to fetch leagues
      throw error;
    }
  },

  async getLeagueStandings(leagueId: number, season?: number): Promise<{ response: TeamStanding[] }> {
    // If no season provided, use the current season
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // Most leagues run from August to May, so adjust season year accordingly
    const defaultSeason = currentMonth >= 7 ? currentYear : currentYear - 1;
    const targetSeason = season || defaultSeason;

    try {
      // Make parallel requests for standings and live fixtures
      const [standingsData, liveFixtures] = await Promise.all([
        makeApiRequestWithCache('/standings', {
          league: leagueId.toString(),
          season: targetSeason.toString()
        }, CACHE_DURATION.STANDINGS),
        this.getLiveFixturesByLeague(leagueId)
      ]);

      // Check if we got a valid response
      if (!standingsData) {
        throw new Error('No data received from API');
      }

      // Check if the response contains the expected data structure
      if (!standingsData.response || !Array.isArray(standingsData.response) || standingsData.response.length === 0) {
        return { response: [] };
      }

      // The API returns an array of league data, we take the first one
      const leagueData = standingsData.response[0];

      // Check if we have league data and standings
      if (!leagueData?.league?.standings) {
        return { response: [] };
      }

      // The standings are in the first element of the standings array
      const standings = leagueData.league.standings[0];

      if (!standings || !Array.isArray(standings)) {
        return { response: [] };
      }

      // Enhance standings with live match data
      const enhancedStandings = standings.map(team => {
        const liveMatch = liveFixtures.find(fixture =>
          fixture.teams.home.id === team.team.id || fixture.teams.away.id === team.team.id
        );

        if (liveMatch) {
          const isHome = liveMatch.teams.home.id === team.team.id;
          const opponent = isHome ? liveMatch.teams.away.name : liveMatch.teams.home.name;
          const homeScore = liveMatch.goals.home || 0;
          const awayScore = liveMatch.goals.away || 0;

          return {
            ...team,
            isLive: true,
            liveMatch: {
              fixtureId: liveMatch.fixture.id,
              opponent,
              status: liveMatch.fixture.status.short,
              elapsed: liveMatch.fixture.status.elapsed,
              score: `${homeScore}-${awayScore}`
            }
          };
        }

        return team;
      });

      console.log('Raw API standings data:', standingsData);
      console.log('Enhanced standings count:', enhancedStandings.length);
      console.log('First few teams:', enhancedStandings.slice(0, 3));

      return { response: enhancedStandings };

    } catch (error) {
      console.error('Failed to fetch league standings:', error);
      return { response: [] };
    }
  },

  async getCountries(): Promise<{ response: Array<{ name: string; code: string; flag: string }> }> {
    try {
      const data = await makeApiRequestWithCache('/countries', {}, 24 * 60 * 60 * 1000); // Cache for 24 hours

      if (!data?.response || !Array.isArray(data.response)) {
        return { response: [] };
      }

      // Filter out invalid entries if any
      const validCountries = data.response.filter((c: any) => c.name && c.code);

      return { response: validCountries };
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return { response: [] };
    }
  },

  async getLiveFixturesByLeague(leagueId: number): Promise<ApiFixture[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await makeApiRequestWithCache('/fixtures', {
        league: leagueId.toString(),
        date: today,
        status: 'NS-1H-HT-2H-ET-BT-P-SUSP-INT-LIVE'
      }, CACHE_DURATION.LIVE_FIXTURES);

      if (!data?.response || !Array.isArray(data.response)) {
        return [];
      }

      // Filter for live matches only
      return data.response.filter(fixture =>
        ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(fixture.fixture.status.short)
      );
    } catch (error) {
      console.error('Failed to fetch live fixtures:', error);
      return [];
    }
  },

  async getFixturesByLeague(leagueId: number, season?: number): Promise<ApiFixture[]> {
    const currentSeason = season || new Date().getFullYear();
    const data = await makeApiRequestWithCache('/fixtures', {
      league: leagueId.toString(),
      season: currentSeason.toString()
    }, CACHE_DURATION.FIXTURES);

    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response;
  },

  async getFixturesByDate(date: string): Promise<ApiResponse> {
    const currentDate = new Date(date);
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;

    // Fetch fixtures only — odds are loaded separately via getOddsForFixtures
    const isToday = formattedDate === new Date().toISOString().split('T')[0];
    const cacheDuration = isToday ? CACHE_DURATION.LIVE_FIXTURES : CACHE_DURATION.FIXTURES;

    const fixturesData = await makeApiRequestWithCache('/fixtures', {
      date: formattedDate,
      timezone: 'Africa/Lagos'
    }, cacheDuration);

    if (!fixturesData.response || !Array.isArray(fixturesData.response)) {
      throw new Error('Invalid fixtures data format received from API');
    }

    // Filter valid fixtures
    const validFixtures = fixturesData.response.filter((fixture: any) =>
      fixture?.fixture?.id &&
      fixture?.teams?.home?.id &&
      fixture?.teams?.away?.id
    );

    return {
      ...fixturesData,
      response: validFixtures,
      results: validFixtures.length
    };
  },

  // Separate odds fetching — called in background after fixtures are displayed
  async getOddsForFixtures(fixtures: ApiFixture[], date: string): Promise<Record<number, { home: string; draw: string; away: string }>> {
    const formattedDate = date;

    const priorityLeagueKeywords = [
      'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
      'Champions League', 'Europa League', 'Conference League',
      'Eredivisie', 'Primeira Liga', 'Championship', 'Major League Soccer',
      'Brasileirão', 'Professional Football League'
    ];

    const leaguesToFetch = new Map<number, number>();

    fixtures.forEach((fixture: any) => {
      const leagueName = fixture.league.name;
      const leagueCountry = fixture.league.country;
      const leagueId = fixture.league.id;
      const season = fixture.league.season;

      const isPriority = priorityLeagueKeywords.some(keyword =>
        leagueName.includes(keyword) ||
        (leagueCountry === 'England' && leagueName === 'FA Cup') ||
        (leagueCountry === 'England' && leagueName === 'League Cup') ||
        (leagueCountry === 'Spain' && leagueName === 'Copa del Rey') ||
        (leagueCountry === 'Italy' && leagueName === 'Coppa Italia') ||
        (leagueCountry === 'Germany' && leagueName === 'DFB Pokal') ||
        (leagueCountry === 'France' && leagueName === 'Coupe de France')
      );

      if (isPriority) {
        leaguesToFetch.set(leagueId, season);
      }
    });

    if (leaguesToFetch.size === 0) return {};

    const oddsPromises = Array.from(leaguesToFetch.entries()).map(([leagueId, season]) =>
      this.getOddsByLeague(leagueId, season, formattedDate)
    );

    const oddsResults = await Promise.all(oddsPromises);

    const oddsMap: Record<number, { home: string; draw: string; away: string }> = {};

    oddsResults.forEach((oddsResponse) => {
      if (oddsResponse?.response && Array.isArray(oddsResponse.response)) {
        oddsResponse.response.forEach((oddsItem: any) => {
          const fixtureId = oddsItem.fixture?.id;
          if (fixtureId && oddsItem.bookmakers && oddsItem.bookmakers.length > 0) {
            const bookmaker = oddsItem.bookmakers[0];
            const matchWinnerBet = bookmaker.bets?.find((bet: any) => bet.name === 'Match Winner');

            if (matchWinnerBet && matchWinnerBet.values) {
              const homeOdd = matchWinnerBet.values.find((v: any) => v.value === 'Home')?.odd;
              const drawOdd = matchWinnerBet.values.find((v: any) => v.value === 'Draw')?.odd;
              const awayOdd = matchWinnerBet.values.find((v: any) => v.value === 'Away')?.odd;

              if (homeOdd && drawOdd && awayOdd) {
                oddsMap[fixtureId] = { home: homeOdd, draw: drawOdd, away: awayOdd };
              }
            }
          }
        });
      }
    });

    return oddsMap;
  },

  async searchFixtures(query: string): Promise<{ response: ApiFixture[] }> {
    // Searching fixtures

    // First, search for teams that match the query
    const teamsResponse = await this.searchTeams(query);
    const teamIds = teamsResponse.response.map(team => team.team.id);

    // Then get fixtures for those teams
    const today = new Date();
    const year = today.getFullYear();
    const fixturesPromises = teamIds.map(teamId =>
      this.getTeamFixtures(teamId, year)
    );

    const fixturesResponses = await Promise.all(fixturesPromises);
    const allFixtures = fixturesResponses.flatMap(res => res.response);

    // Filter fixtures by query in case team search was too broad
    const filteredFixtures = allFixtures.filter(fixture =>
      fixture.teams.home.name.toLowerCase().includes(query.toLowerCase()) ||
      fixture.teams.away.name.toLowerCase().includes(query.toLowerCase()) ||
      fixture.league.name.toLowerCase().includes(query.toLowerCase())
    );

    return { response: filteredFixtures };
  },

  async getHeadToHead(team1Id: number, team2Id: number): Promise<{ response: ApiFixture[] }> {
    try {
      const data = await makeApiRequestWithCache('/fixtures/headtohead', {
        h2h: `${team1Id}-${team2Id}`
      }, CACHE_DURATION.FIXTURES);

      if (!data?.response || !Array.isArray(data.response)) {
        return { response: [] };
      }

      // Return last 10 H2H matches
      return { response: data.response.slice(0, 10) };
    } catch (error) {
      console.error('Failed to fetch H2H data:', error);
      return { response: [] };
    }
  },


  async getOddsByLeague(leagueId: number, season: number, date: string): Promise<{ response: any[] }> {
    try {
      const data = await makeApiRequestWithCache('/odds', {
        league: leagueId.toString(),
        season: season.toString(),
        date: date,
        timezone: 'Africa/Lagos'
      }, CACHE_DURATION.ODDS);

      if (!data?.response || !Array.isArray(data.response)) {
        return { response: [] };
      }
      return data;
    } catch (error) {
      console.error(`Failed to fetch odds for league ${leagueId}:`, error);
      return { response: [] };
    }
  },

  async getOddsByDate(date: string): Promise<{ response: any[] }> {
    // Deprecated: Too heavy on API. Use getOddsByLeague instead.
    return { response: [] };
  },

  async getFixtureOdds(fixtureId: string): Promise<{ response: any[] }> {
    try {
      const data = await makeApiRequestWithCache('/odds', {
        fixture: fixtureId
      }, CACHE_DURATION.FIXTURES);

      if (!data?.response || !Array.isArray(data.response)) {
        return { response: [] };
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch odds data:', error);
      return { response: [] };
    }
  }
};
