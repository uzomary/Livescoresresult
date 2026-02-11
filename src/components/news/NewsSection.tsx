import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewsCard } from './NewsCard';
import { NewsLoader } from './NewsLoader';
import { blogService, BlogPost } from '@/services/blogService';
import { Newspaper, RefreshCw, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewsSectionProps {
  maxPosts?: number;
  showHeader?: boolean;
  className?: string;
}

export const NewsSection = ({
  maxPosts = 5,
  showHeader = true,
  className = ''
}: NewsSectionProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadPosts = async () => {
    setIsRefreshing(true);
    const publishedPosts = await blogService.getPublished();
    setPosts(publishedPosts.slice(0, maxPosts));
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadPosts();
  }, [maxPosts]);

  const handleRefresh = async () => {
    await loadPosts();
  };

  const handlePostClick = (post: BlogPost) => {
    navigate(`/news/${post.slug}`);
  };

  return (
    <div className={`w-80 bg-white border-l border-gray-200 h-full overflow-y-auto ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00141e] to-[#002535] rounded-xl flex items-center justify-center shadow-md">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[#00141e] font-bold text-base">Latest News</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {posts?.length ? `${posts.length} articles` : 'Loading...'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {isLoading && <NewsLoader count={maxPosts} />}

        {/* Empty State */}
        {!isLoading && (!posts || posts.length === 0) && (
          <Card className="bg-gray-50 border-gray-200 p-6 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h4 className="text-gray-900 font-semibold mb-1">No News Available</h4>
            <p className="text-gray-600 text-sm mb-3">
              No articles found at the moment
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
            >
              Refresh
            </Button>
          </Card>
        )}

        {/* News List */}
        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <NewsCard
                key={post.id}
                post={post}
                onClick={handlePostClick}
              />
            ))}

            {/* View More Link */}
            {posts.length > 0 && (
              <Card className="bg-gradient-to-r from-red-50 to-white border-red-100 p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/news')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 w-full font-semibold"
                >
                  <span>View All Articles</span>
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Last Updated Info */}
        {!isLoading && posts && posts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center italic">
              Updated in real-time
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
