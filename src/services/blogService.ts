
import { supabase } from '@/lib/supabase';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    createdAt: string; // ISO string
    published: boolean;
}

// Helper to generate slug from title
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

class BlogService {
    async getAll(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all posts:', error);
            return [];
        }

        return data.map(post => this.mapToBlogPost(post));
    }

    async getPublished(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching published posts:', error);
            return [];
        }

        return data.map(post => this.mapToBlogPost(post));
    }

    async getById(id: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching post by id ${id}:`, error);
            return null;
        }

        return this.mapToBlogPost(data);
    }

    async getBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching post by slug ${slug}:`, error);
            return null;
        }

        return this.mapToBlogPost(data);
    }

    async create(post: Omit<BlogPost, 'id' | 'createdAt' | 'slug'>): Promise<BlogPost | null> {
        const slug = generateSlug(post.title);

        // Supabase will handle slug uniqueness if we set a constraint or handle it here
        // For simplicity, let's just create it and let the database error if duplicate slug (which we should handle)

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                title: post.title,
                slug: slug,
                excerpt: post.excerpt,
                content: post.content,
                image: post.image,
                category: post.category,
                author: post.author,
                published: post.published
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            // Handle duplicate slug error specifically if needed
            if (error.code === '23505') { // Postgres unique violation
                const fallbackSlug = `${slug}-${Date.now().toString().slice(-4)}`;
                return this.createWithSlug({ ...post, slug: fallbackSlug });
            }
            return null;
        }

        return this.mapToBlogPost(data);
    }

    // Secondary create helper for retry with modified slug
    private async createWithSlug(post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('posts')
            .insert([post])
            .select()
            .single();

        if (error) return null;
        return this.mapToBlogPost(data);
    }

    async update(id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): Promise<BlogPost | null> {
        const updateData: any = { ...updates };

        if (updates.title) {
            updateData.slug = generateSlug(updates.title);
        }

        const { data, error } = await supabase
            .from('posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating post ${id}:`, error);
            return null;
        }

        return this.mapToBlogPost(data);
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting post ${id}:`, error);
            return false;
        }

        return true;
    }

    private mapToBlogPost(dbPost: any): BlogPost {
        return {
            id: dbPost.id,
            title: dbPost.title,
            slug: dbPost.slug,
            excerpt: dbPost.excerpt || '',
            content: dbPost.content,
            image: dbPost.image || '',
            category: dbPost.category || 'General',
            author: dbPost.author || 'Admin',
            createdAt: dbPost.created_at,
            published: dbPost.published || false,
        };
    }
}

export const blogService = new BlogService();
