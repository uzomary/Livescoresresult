import { ApiLeague } from './footballApi';
import { footballApi } from './footballApi';

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag?: string;
  season: number;
  type?: string;
}

const transformLeague = (apiLeague: ApiLeague): League => {
  return {
    id: apiLeague.league.id,
    name: apiLeague.league.name,
    country: apiLeague.country.name,
    logo: apiLeague.league.logo,
    flag: apiLeague.country.flag || undefined,
    season: apiLeague.seasons.find(s => s.current)?.year || new Date().getFullYear(),
    type: apiLeague.league.type
  };
};

export const getLeagues = async (): Promise<League[]> => {
  try {
    const { response } = await footballApi.getLeagues();
    return response.map(transformLeague);
  } catch (error) {
    console.error('Failed to fetch leagues:', error);
    return []; // Return empty array or handle error as needed
  }
};

export const getLeaguesByCountry = async (country: string): Promise<League[]> => {
  const leagues = await getLeagues();
  return leagues.filter(league => 
    league.country.toLowerCase() === country.toLowerCase()
  );
};

export const getLeagueById = async (id: number): Promise<League | undefined> => {
  const leagues = await getLeagues();
  return leagues.find(league => league.id === id);
};
