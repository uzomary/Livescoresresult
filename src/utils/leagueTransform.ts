import { League } from '@/services/theSportsDbApi';

export interface TransformedLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  type: string;
  season: string;
  flag?: string;
  description?: string;
  website?: string;
  banner?: string;
  poster?: string;
}

export function transformLeague(apiLeague: League): TransformedLeague {
  return {
    id: parseInt(apiLeague.idLeague, 10),
    name: apiLeague.strLeague,
    country: apiLeague.strCountry || 'International',
    logo: apiLeague.strLogo || apiLeague.strBadge || '',
    type: apiLeague.strSport || 'Soccer',
    season: apiLeague.strCurrentSeason || new Date().getFullYear().toString(),
    description: apiLeague.strDescriptionEN,
    website: apiLeague.strWebsite,
    banner: apiLeague.strBanner,
    poster: apiLeague.strPoster,
  };
}

export function transformLeagues(leagues: League[]): TransformedLeague[] {
  return leagues.map(transformLeague);
}
