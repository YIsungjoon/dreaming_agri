import { createServerSupabaseClient } from '$lib/server/supabase';

export async function load() {
	const supabase = createServerSupabaseClient();

	if (!supabase) {
		return {
			farm: null,
			weather: null,
			supabase: {
				configured: false,
				error: null
			}
		};
	}

	const { data: farm, error: farmError } = await supabase
		.from('farms')
		.select('id, slug, name, region, latitude, longitude, timezone')
		.eq('slug', 'gimje-demo-farm')
		.maybeSingle();

	if (farmError || !farm) {
		return {
			farm: null,
			weather: null,
			supabase: {
				configured: true,
				error: farmError?.message ?? '가상농장 데이터를 찾을 수 없습니다.'
			}
		};
	}

	const { data: weather, error: weatherError } = await supabase
		.from('weather_observations')
		.select(
			'observed_at, temperature_c, relative_humidity_pct, precipitation_mm, rain_mm, weather_code, wind_speed_kph, wind_direction_deg, source'
		)
		.eq('farm_id', farm.id)
		.order('observed_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	return {
		farm,
		weather,
		supabase: {
			configured: true,
			error: weatherError?.message ?? null
		}
	};
}
