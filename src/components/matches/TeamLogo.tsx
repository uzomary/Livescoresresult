import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { assets } from "@/assets/images";

interface TeamLogoProps {
  teamName: string;
  logoUrl?: string | null;
  className?: string;
}

const fetchTeamLogo = async (teamName: string): Promise<string | null> => {
  if (!teamName) return null;

  try {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.teams && data.teams.length > 0) {
      return data.teams[0].strTeamBadge;
    }
    return null;
  } catch (error) {
    // Failed to fetch team logo
    return null;
  }
};

export const TeamLogo = ({ teamName, logoUrl: providedLogoUrl, className }: TeamLogoProps) => {
  // If we have a provided logo URL (from API-Sports), use it directly
  if (providedLogoUrl) {
    return <img src={providedLogoUrl} alt="" className={className} />;
  }

  const { data: fetchedLogoUrl, isLoading } = useQuery({
    queryKey: ['teamLogo', teamName],
    queryFn: () => fetchTeamLogo(teamName),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    enabled: !!teamName,
  });

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  return <img src={fetchedLogoUrl || assets.preloader} alt="" className={className} />;
};
