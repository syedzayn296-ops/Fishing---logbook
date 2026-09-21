import { MarineWeatherData } from '../types';

const CACHE_PREFIX = 'sa_weather_cache_';

export function getCacheKey(lat: number, lon: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export function getCachedMarineWeather(lat: number, lon: number): MarineWeatherData | null {
  try {
    const key = getCacheKey(lat, lon);
    const cachedStr = localStorage.getItem(key);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr) as MarineWeatherData;
      return {
        ...parsed,
        isOfflineSnapshot: true,
      };
    }
  } catch (err) {
    console.warn('Failed to read cached marine weather:', err);
  }
  return null;
}

export function saveCachedMarineWeather(lat: number, lon: number, data: MarineWeatherData): void {
  try {
    const key = getCacheKey(lat, lon);
    const toSave: MarineWeatherData = {
      ...data,
      cachedAt: new Date().toISOString(),
      isOfflineSnapshot: false,
    };
    localStorage.setItem(key, JSON.stringify(toSave));
    localStorage.setItem('sa_weather_latest_spot', JSON.stringify({ key, lat, lon, data: toSave }));
  } catch (err) {
    console.warn('Failed to write cached marine weather to localStorage:', err);
  }
}

export async function fetchMarineWeather(lat: number, lon: number): Promise<MarineWeatherData | null> {
  // If browser is explicitly offline, immediately serve local cache if available
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = getCachedMarineWeather(lat, lon);
    if (cached) {
      return cached;
    }
  }

  try {
    // Abort if network stalls (e.g. weak 3G/Edge signal along rocky cliffs)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/marine-weather?lat=${lat}&lon=${lon}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    const marine = data.marine?.current;
    const weather = data.weather?.current;
    const daily = data.weather?.daily;

    const temp = weather?.temperature_2m;
    const apparentTemp = weather?.apparent_temperature;
    const windSpeedKm = weather?.wind_speed_10m;
    const windSpeedKnots = typeof windSpeedKm === 'number' ? Math.round(windSpeedKm * 0.539957 * 10) / 10 : null;
    const windDir = weather?.wind_direction_10m;
    const gusts = weather?.wind_gusts_10m;
    const pressure = weather?.surface_pressure;
    const weatherCode = weather?.weather_code;

    const waveHeight = marine?.wave_height;
    const wavePeriod = marine?.wave_period;
    const waveDir = marine?.wave_direction;
    const swellHeight = marine?.swell_wave_height;
    const swellPeriod = marine?.swell_wave_period;
    const swellDir = marine?.swell_wave_direction;

    if (
      typeof temp !== 'number' ||
      typeof apparentTemp !== 'number' ||
      typeof windSpeedKm !== 'number' ||
      typeof windSpeedKnots !== 'number' ||
      typeof windDir !== 'number' ||
      typeof gusts !== 'number' ||
      typeof pressure !== 'number' ||
      typeof weatherCode !== 'number' ||
      typeof waveHeight !== 'number' ||
      typeof wavePeriod !== 'number' ||
      typeof waveDir !== 'number' ||
      typeof swellHeight !== 'number' ||
      typeof swellPeriod !== 'number' ||
      typeof swellDir !== 'number'
    ) {
      throw new Error('Marine weather response is incomplete');
    }

    const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    const uvIndex = typeof daily?.uv_index_max?.[0] === 'number' ? daily.uv_index_max[0] : undefined;

    // Calculate a transparent marine-condition score (1 - 10). This is not a fish-catch prediction.
    let score = 7;
    let label: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Prime Time' = 'Good';
    let summary = 'Marine conditions are moderate based on the available wind and wave inputs.';

    if (waveHeight > 3.2 || windSpeedKnots > 24) {
      score = 3;
      label = 'Poor';
      summary = 'Strong wind and/or high wave conditions. Use caution and assess local conditions before fishing.';
    } else if (waveHeight < 0.8 && windSpeedKnots < 5) {
      score = 5;
      label = 'Fair';
      summary = 'Light wind and low wave conditions. Local water clarity and fish activity are not predicted by this score.';
    } else if (swellPeriod >= 11 && swellHeight >= 1.2 && swellHeight <= 2.2 && windSpeedKnots <= 14) {
      score = 9;
      label = 'Prime Time';
      summary = 'The wind, swell height and swell period fall within a favourable marine-condition range; local fishing activity can still vary.';
    } else if (swellHeight <= 2.5 && windSpeedKnots <= 18) {
      score = 7;
      label = 'Good';
      summary = 'Wind and swell are within a moderate range for coastal angling; local conditions can still vary.';
    }

    const weatherResult: MarineWeatherData = {
      temperature: Math.round(temp),
      apparentTemperature: Math.round(apparentTemp),
      windSpeed: Math.round(windSpeedKm),
      windSpeedKnots,
      windDirection: windDir,
      windGusts: Math.round(gusts),
      surfacePressure: Math.round(pressure),
      weatherCode,
      waveHeight: Math.round(waveHeight * 10) / 10,
      wavePeriod: Math.round(wavePeriod),
      waveDirection: waveDir,
      swellWaveHeight: Math.round(swellHeight * 10) / 10,
      swellWavePeriod: Math.round(swellPeriod),
      swellWaveDirection: swellDir,
      sunrise,
      sunset,
      uvIndex,
      biteRating: {
        score,
        label,
        summary,
      },
      cachedAt: new Date().toISOString(),
      isOfflineSnapshot: false,
    };

    // Cache locally for offline survival
    saveCachedMarineWeather(lat, lon, weatherResult);

    return weatherResult;
  } catch (error) {
    console.warn('Network unavailable, inspecting local weather cache:', error);
    
    // Check if we have a cached version in localStorage
    const localCached = getCachedMarineWeather(lat, lon);
    if (localCached) {
      return localCached;
    }

    // No fabricated fallback: without live data or a cached snapshot, report unavailable.
    return null;
  }
}

export function getWindCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
