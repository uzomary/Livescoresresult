interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  date: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

interface WordPressApiResponse {
  posts: WordPressPost[];
  total: number;
}

const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://blog.livescoreresult.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for WordPress posts
let cachedPosts: WordPressPost[] = [];
let lastFetchTime = 0;

// Helper function to strip HTML tags from content
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const wordpressApi = {
  async getLatestPosts(limit: number = 5): Promise<WordPressPost[]> {
    const now = Date.now();

    // Return cached data if still fresh
    if (cachedPosts.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return cachedPosts.slice(0, limit);
    }

    try {
      const response = await fetch(
        `${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?per_page=${limit}&_embed=wp:featuredmedia&orderby=date&order=desc`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }

      const posts: WordPressPost[] = await response.json();

      // Process posts to clean up content
      const processedPosts = posts.map(post => ({
        ...post,
        title: {
          rendered: stripHtml(post.title.rendered)
        },
        excerpt: {
          rendered: truncateText(stripHtml(post.excerpt.rendered))
        }
      }));

      // Update cache
      cachedPosts = processedPosts;
      lastFetchTime = now;

      return processedPosts;
    } catch (error) {
      console.error('Failed to fetch WordPress posts:', error);

      // Return cached data if available, otherwise empty array
      return cachedPosts.length > 0 ? cachedPosts.slice(0, limit) : [];
    }
  },

  async searchPosts(query: string, limit: number = 10): Promise<WordPressPost[]> {
    try {
      const response = await fetch(
        `${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=${limit}&_embed=wp:featuredmedia`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WordPress search error: ${response.status}`);
      }

      const posts: WordPressPost[] = await response.json();

      // Process posts to clean up content
      return posts.map(post => ({
        ...post,
        title: {
          rendered: stripHtml(post.title.rendered)
        },
        excerpt: {
          rendered: truncateText(stripHtml(post.excerpt.rendered))
        }
      }));
    } catch (error) {
      console.error('Failed to search WordPress posts:', error);
      return [];
    }
  },

  // Clear cache manually if needed
  clearCache(): void {
    cachedPosts = [];
    lastFetchTime = 0;
  },

  // Get cache status
  getCacheInfo(): { hasCachedData: boolean; lastFetch: number; cacheAge: number } {
    return {
      hasCachedData: cachedPosts.length > 0,
      lastFetch: lastFetchTime,
      cacheAge: Date.now() - lastFetchTime
    };
  }
};

export type { WordPressPost };
