import { createServerSupabaseClient } from '$lib/server/supabase';

export async function load() {
	const supabase = createServerSupabaseClient();

	if (!supabase) {
		return {
			countries: [],
			supabase: {
				configured: false,
				error: null
			}
		};
	}

	const { data, error } = await supabase.from('countries').select('id, name').order('id');

	return {
		countries: data ?? [],
		supabase: {
			configured: true,
			error: error?.message ?? null
		}
	};
}
