import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/services/rssApi';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Clock, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface NewsCardProps {
  post: NewsItem;
  onClick?: (post: NewsItem) => void;
}

export const NewsCard = ({ post, onClick }: NewsCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(post);
    } else {
      window.open(post.link, '_blank', 'noopener,noreferrer');
    }
  };

  // RSS feed thumbnails are directly in the item
  const featuredImage = post.thumbnail;

  // Handle various date formats effectively or fallback to current date
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(post.pubDate), { addSuffix: true });
  } catch (e) {
    timeAgo = 'Recently';
  }

  return (
    <Card
      className="bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="p-3">
        {/* Featured Image */}
        {featuredImage && !imageError && (
          <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-100 aspect-video">
            <img
              src={featuredImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        )}

        {/* No Image Placeholder */}
        {(!featuredImage || imageError) && (
          <div className="mb-3 h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h4 className="text-[#00141e] font-bold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h4>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Read</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
