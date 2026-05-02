import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://livescoresresult.com';

// Parse .env.local to get Supabase credentials
const loadEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        return Object.fromEntries(
            envContent.split('\n')
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        let val = match[2].trim();
                        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                        return [match[1].trim(), val];
                    }
                    return [];
                })
                .filter(arr => arr.length)
        );
    } catch (e) {
        console.warn('Warning: Could not load .env.local, falling back to process.env');
        return process.env;
    }
};

async function generateSitemap() {
    const env = loadEnv();
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

    // Static pages
    const staticPages = [
        { url: '/', priority: 1.0, changefreq: 'hourly' },
        { url: '/leagues', priority: 0.8, changefreq: 'daily' },
        { url: '/fixtures', priority: 0.9, changefreq: 'hourly' },
        { url: '/competitions', priority: 0.6, changefreq: 'weekly' },
        { url: '/news', priority: 0.8, changefreq: 'daily' },
        { url: '/contact', priority: 0.5, changefreq: 'monthly' },
        { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
        { url: '/terms', priority: 0.3, changefreq: 'yearly' },
        { url: '/advertise', priority: 0.5, changefreq: 'monthly' }
    ];

    let dynamicUrls = [];

    if (supabaseUrl && supabaseKey) {
        try {
            // Remove trailing slash if present
            const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
            
            // Fetch published posts
            const response = await fetch(`${baseUrl}/rest/v1/posts?published=eq.true&select=slug,created_at`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });

            if (response.ok) {
                const posts = await response.json();
                dynamicUrls = posts.map(post => ({
                    url: `/news/${post.slug}`,
                    priority: 0.7,
                    changefreq: 'weekly',
                    lastmod: post.created_at
                }));
                console.log(`Fetched ${posts.length} dynamic blog routes for sitemap.`);
            } else {
                console.error(`Failed to fetch posts from Supabase: ${response.status} ${response.statusText}`);
            }
        } catch (e) {
            console.error('Error fetching dynamic routes:', e.message);
        }
    } else {
        console.warn('Supabase URL or Key is missing. Dynamic blog routes will not be generated.');
    }

    const allUrls = [...staticPages, ...dynamicUrls];

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write to public/sitemap.xml
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const outputPath = path.resolve(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    
    console.log(`Successfully generated sitemap with ${allUrls.length} URLs at ${outputPath}`);
}

generateSitemap();
