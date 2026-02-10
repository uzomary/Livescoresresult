const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

export const fetchLeagueStandings = async (leagueId: number, season: number) => {
  const url = `${BASE_URL}/standings?league=${leagueId}&season=${season}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '49afd34bd0mshe77f27c5f863c3dp16075djsn559432e28ea9',
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch league standings');
  }

  const data = await response.json();
  return data.response[0]?.league.standings[0] || []; // Return the standings array
};

export const fetchSeasonMatchesByLeagueId = async (leagueId: string, season?: string) => {
  const currentYear = new Date().getFullYear();
  const seasonYear = season || currentYear.toString();
  const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${seasonYear}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '49afd34bd0mshe77f27c5f863c3dp16075djsn559432e28ea9',
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch season matches');
  }

  const data = await response.json();
  return data.response || [];
};

