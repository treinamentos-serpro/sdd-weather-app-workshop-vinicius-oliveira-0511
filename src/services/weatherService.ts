import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

interface GeocodingResult {
  id?: number | null;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string | null;
  country?: string | null;
  country_code?: string | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isRecord(error) && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades.', response.status);
  }

  const data: GeocodingResponse = await response.json();

  return (data.results ?? []).slice(0, 10).map((result) => ({
    id: result.id ?? null,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    admin1: result.admin1 ?? null,
    country: result.country ?? null,
    countryCode: result.country_code ?? null,
    timezone: result.timezone ?? null,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dailyNumber(values: unknown, index: number): number | null {
  return Array.isArray(values) ? numberOrNull(values[index]) : null;
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,precipitation',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível consultar o clima.', response.status);
  }

  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    !isRecord(data.current) ||
    !isRecord(data.daily) ||
    !Array.isArray(data.daily.time) ||
    !data.daily.time.every((date: unknown) => typeof date === 'string')
  ) {
    throw new WeatherServiceError('Resposta meteorológica incompleta.', response.status);
  }

  const current: CurrentWeather = {
    temperatureC: numberOrNull(data.current.temperature_2m),
    weatherCode: numberOrNull(data.current.weather_code),
    referenceTime: typeof data.current.time === 'string' ? data.current.time : null,
  };
  if (data.current.precipitation !== undefined) {
    current.precipitationMm =
      data.current.precipitation === null ? 0 : numberOrNull(data.current.precipitation);
  }
  const dailyData = data.daily;
  const daily: ForecastDay[] = data.daily.time.slice(0, 5).map((date: string, index: number) => ({
    date,
    weatherCode: dailyNumber(dailyData.weather_code, index),
    temperatureMinC: dailyNumber(dailyData.temperature_2m_min, index),
    temperatureMaxC: dailyNumber(dailyData.temperature_2m_max, index),
  }));

  return {
    location: {
      ...city,
      timezone: typeof data.timezone === 'string' ? data.timezone : city.timezone,
    },
    current,
    daily,
    retrievedAt: new Date().toISOString(),
  };
}
