import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLeaguesByCountry } from '@/services/leagueService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import MetaTags from '@/components/MetaTags';

const CountryDetailsPage = () => {
    const { countryName } = useParams<{ countryName: string }>();

    const { data: leagues, isLoading } = useQuery({
        queryKey: ['country-leagues', countryName],
        queryFn: async () => {
            if (!countryName) return [];
            // Normalize country name from URL slug if needed, but getLeaguesByCountry should handle basic names
            const formattedCountry = countryName.replace(/-/g, ' ');
            return getLeaguesByCountry(formattedCountry);
        },
        enabled: !!countryName,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const formattedName = countryName?.replace(/-/g, ' ').toUpperCase();

    return (
        <div className="space-y-6">
            <MetaTags
                title={`${formattedName} Football Leagues & Cups`}
                description={`Follow all football leagues and cup competitions in ${formattedName}. Live scores, results, fixtures and standings.`}
            />

            <div className="flex items-center gap-4">
                {leagues?.[0]?.flag && (
                    <img
                        src={leagues[0].flag}
                        alt={formattedName}
                        className="w-10 h-10 object-contain rounded-full border border-gray-100 shadow-sm"
                    />
                )}
                <h1 className="text-2xl font-bold text-[#00141e]">{formattedName}</h1>
            </div>

            <div className="flex flex-col gap-2">
                {leagues && leagues.length > 0 ? (
                    leagues.map((league) => (
                        <Link
                            key={league.id}
                            to={`/leagues/${countryName}/${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block group"
                        >
                            <Card className="hover:shadow-md transition-shadow border-gray-200">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={league.logo}
                                            alt={league.name}
                                            className="w-10 h-10 object-contain"
                                            loading="lazy"
                                        />
                                        <div>
                                            <h3 className="font-bold text-[#00141e] group-hover:text-[#ff0046] transition-colors">
                                                {league.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 capitalize">{league.type}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#ff0046] transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100">
                        <p>No active leagues found for {formattedName}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CountryDetailsPage;
