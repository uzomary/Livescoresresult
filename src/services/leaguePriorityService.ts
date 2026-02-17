
import { supabase } from '@/lib/supabase';

export interface LeaguePriority {
    id: string;
    league_name: string;
    priority: number;
    created_at?: string;
}

class LeaguePriorityService {
    async getAll(): Promise<Record<string, number>> {
        const { data, error } = await supabase
            .from('league_priorities')
            .select('*');

        if (error) {
            console.error('Error fetching league priorities:', error);
            return {};
        }

        // Convert array to Record<string, number> for easy lookup
        return data.reduce((acc, curr) => {
            acc[curr.league_name] = curr.priority;
            return acc;
        }, {} as Record<string, number>);
    }

    async getList(): Promise<LeaguePriority[]> {
        const { data, error } = await supabase
            .from('league_priorities')
            .select('*')
            .order('priority', { ascending: true });

        if (error) {
            console.error('Error fetching league priorities list:', error);
            return [];
        }

        return data;
    }

    async upsert(leagueName: string, priority: number): Promise<LeaguePriority | null> {
        // Check if exists first
        const { data: existing } = await supabase
            .from('league_priorities')
            .select('id')
            .eq('league_name', leagueName)
            .single();

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('league_priorities')
                .update({ priority })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating league priority:', error);
                return null;
            }
            return data;
        } else {
            // Insert
            const { data, error } = await supabase
                .from('league_priorities')
                .insert([{ league_name: leagueName, priority }])
                .select()
                .single();

            if (error) {
                console.error('Error creating league priority:', error);
                return null;
            }
            return data;
        }
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('league_priorities')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting league priority ${id}:`, error);
            return false;
        }

        return true;
    }
    async getAvailableLeagues(): Promise<{ name: string, country: string }[]> {
        try {
            // We need to import getting available leagues from footballApi
            // But footballApi is in a different file layer, let's look at how to get it
            // Ideally we need a method in footballApi that returns all leagues
            // For now, let's assume we can import footballApi here or use a similar approach
            const { footballApi } = await import('./footballApi');
            const response = await footballApi.getLeagues();

            if (response && response.response) {
                return response.response.map((item: any) => ({
                    name: item.league.name,
                    country: item.country.name
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching available leagues:', error);
            return [];
        }
    }
    async updateAll(priorities: { id: string, priority: number }[]): Promise<boolean> {
        try {
            for (const item of priorities) {
                const { error } = await supabase
                    .from('league_priorities')
                    .update({ priority: item.priority })
                    .eq('id', item.id);

                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error('Error updating all priorities:', error);
            return false;
        }
    }
}

export const leaguePriorityService = new LeaguePriorityService();
