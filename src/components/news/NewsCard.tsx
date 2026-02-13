import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/services/blogService';
import { NewsItem } from '@/services/rssApi';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Clock, Image as ImageIcon, Tag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewsCardProps {
  post: BlogPost | NewsItem;
  onClick?: (post: any) => void;
}

export const NewsCard = ({ post, onClick }: NewsCardProps) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const isBlogPost = (p: any): p is BlogPost => 'slug' in p;

  const handleClick = () => {
    if (onClick) {
      onClick(post);
    } else if (isBlogPost(post)) {
      navigate(`/news/${post.slug}`);
    } else {
      window.open(post.link, '_blank', 'noopener,noreferrer');
    }
  };

  const featuredImage = isBlogPost(post) ? post.image : post.thumbnail;
  const title = post.title;
  const dateStr = isBlogPost(post) ? post.createdAt : post.pubDate;

  // Handle various date formats effectively or fallback to current date
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch (e) {
    timeAgo = 'Recently';
  }

  return (
    <Card
      className="relative bg-white dark:bg-card border-gray-100 dark:border-border hover:border-red-200 dark:hover:border-red-800 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="p-3">
        {isBlogPost(post) && post.category && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-[#ff0046] hover:bg-[#ff0046] text-white text-[9px] px-1.5 py-0">
              {post.category}
            </Badge>
          </div>
        )}
        {/* Featured Image */}
        {featuredImage && !imageError && (
          <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-muted aspect-video">
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
          <div className="mb-3 h-32 bg-gray-50 dark:bg-muted rounded-lg flex items-center justify-center border border-gray-100 dark:border-border">
            <ImageIcon className="h-8 w-8 text-gray-300 dark:text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h4 className="text-[#00141e] dark:text-foreground font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#ff0046] transition-colors">
            {title}
          </h4>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-muted-foreground font-medium">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-[#ff0046] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Read</span>
              {isBlogPost(post) ? <ArrowRight className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
