export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    author: string;
    content: string;
    thumbnail: string;
    description: string;
}

interface RssResponse {
    status: string;
    feed: {
        url: string;
        title: string;
        link: string;
        author: string;
        description: string;
        image: string;
    };
    items: Array<{
        title: string;
        pubDate: string;
        link: string;
        guid: string;
        author: string;
        thumbnail: string;
        description: string;
        content: string;
        enclosure: object;
        categories: string[];
    }>;
}

const RSS_FEED_URL = 'https://www.skysports.com/rss/12040'; // Sky Sports Football RSS
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

export const rssApi = {
    async getLatestNews(limit: number = 5): Promise<NewsItem[]> {
        try {
            const response = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(RSS_FEED_URL)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch news feed');
            }

            const data: RssResponse = await response.json();

            if (data.status !== 'ok') {
                throw new Error('Failed to parse RSS feed');
            }

            return data.items.slice(0, limit).map(item => ({
                id: item.guid,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                author: item.author || 'Sky Sports',
                content: item.content || item.description,
                thumbnail: item.thumbnail || item.enclosure?.['link'] || '',
                description: item.description
            }));
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }
};
