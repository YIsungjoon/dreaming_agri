import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || privateEnv.SUPABASE_URL || '';
const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || privateEnv.SUPABASE_ANON_KEY || privateEnv.SUPABASE_SERVICE_ROLE_KEY || '';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
	try {
		supabase = createClient(supabaseUrl, supabaseAnonKey);
	} catch (e) {
		console.warn('Failed to initialize Supabase client:', e);
	}
}

export function isSupabaseConnected(): boolean {
	return supabase !== null;
}
