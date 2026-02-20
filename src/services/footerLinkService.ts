import { supabase } from '@/lib/supabase';

export interface FooterLink {
    id: string;
    title: string;
    url: string;
    created_at: string;
}

class FooterLinkService {
    async getAll(): Promise<FooterLink[]> {
        const { data, error } = await supabase
            .from('footer_links')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching footer links:', error);
            return [];
        }

        return data || [];
    }

    async create(link: Omit<FooterLink, 'id' | 'created_at'>): Promise<FooterLink | null> {
        const { data, error } = await supabase
            .from('footer_links')
            .insert([{
                title: link.title,
                url: link.url
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating footer link:', error);
            return null;
        }

        return data;
    }

    async update(id: string, updates: Partial<Omit<FooterLink, 'id' | 'created_at'>>): Promise<FooterLink | null> {
        const { data, error } = await supabase
            .from('footer_links')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating footer link ${id}:`, error);
            return null;
        }

        return data;
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('footer_links')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting footer link ${id}:`, error);
            return false;
        }

        return true;
    }
}

export const footerLinkService = new FooterLinkService();
