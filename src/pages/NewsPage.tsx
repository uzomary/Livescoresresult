import { useQuery } from '@tanstack/react-query';
import { rssApi, NewsItem } from '@/services/rssApi';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2, AlertCircle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsPage = () => {
    const {
        data: posts,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['rss-news-page'],
        queryFn: () => rssApi.getLatestNews(20), // Fetch more items for the main page
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handlePostClick = (post: NewsItem) => {
        window.open(post.link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen">
            <div className="">

                {/* Page Header */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#00141e] rounded-lg flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-[#00141e]">Football News</h1>
                    </div>
                    <p className="text-gray-500 text-lg ml-14">
                        Latest updates, transfer rumors, and match reports from across the globe.
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-[#00141e] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading latest headlines...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load news</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            We couldn't fetch the latest news at this time. Please check your connection and try again.
                        </p>
                        <Button onClick={() => refetch()} className="bg-[#00141e] text-white">
                            Try Again
                        </Button>
                    </div>
                )}

                {/* News Grid */}
                {!isLoading && !error && posts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {posts.map((post) => (
                            <NewsCard
                                key={post.id}
                                post={post}
                                onClick={handlePostClick}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && (!posts || posts.length === 0) && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No news articles found.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NewsPage;
