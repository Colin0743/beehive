import { supabase } from './supabase';
import { Project } from '../types/database';

export async function getProjects(): Promise<Project[]> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(username, avatar_url)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }

        return data as any[];
    } catch (error) {
        console.error('Error in getProjects:', error);
        return [];
    }
}

export async function getProjectById(id: string): Promise<Project | null> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(username, avatar_url)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching project detail:', error);
            return null;
        }

        return data as any;
    } catch (error) {
        console.error('Error in getProjectById:', error);
        return null;
    }
}
