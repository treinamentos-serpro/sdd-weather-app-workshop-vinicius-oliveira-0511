export type Unit = 'celsius' | 'fahrenheit';
export type TemperatureUnit = Unit;

export interface City {
  /** Geocoding identifier; null when the provider omits it. */
  id: number | null;
  /** City name returned by geocoding. */
  name: string;
  /** Latitude used for weather requests. */
  latitude: number;
  /** Longitude used for weather requests. */
  longitude: number;
  /** Administrative region, when available. */
  admin1: string | null;
  /** Country name, when available. */
  country: string | null;
  /** ISO country code, when available. */
  countryCode: string | null;
  /** IANA timezone for local dates and times, when available. */
  timezone: string | null;
}

export type WeatherLocation = City;
export type CitySearchResult = City;

export interface CurrentWeather {
  /** Current temperature normalized to Celsius. */
  temperatureC: number | null;
  /** WMO weather code. */
  weatherCode: number | null;
  /** Provider reference timestamp, interpreted with the city's timezone. */
  referenceTime: string | null;
  /** Relative humidity percentage, when requested from the provider. */
  humidityPercent?: number | null;
  /** Wind speed normalized to kilometers per hour, when available. */
  windSpeedKmh?: number | null;
  /** Precipitation in millimeters, when available. */
  precipitationMm?: number | null;
  /** Surface pressure normalized to hectopascals, when available. */
  pressureHpa?: number | null;
}

export interface ForecastDay {
  /** Local forecast date in YYYY-MM-DD format. */
  date: string;
  /** WMO weather code for this day. */
  weatherCode: number | null;
  /** Daily minimum temperature normalized to Celsius. */
  temperatureMinC: number | null;
  /** Daily maximum temperature normalized to Celsius. */
  temperatureMaxC: number | null;
  /** Maximum precipitation probability percentage, when available. */
  precipitationProbabilityPercent?: number | null;
}

export type DailyForecast = ForecastDay;

export interface WeatherData {
  /** Selected city for this snapshot. */
  location: City;
  /** Current conditions returned by the provider. */
  current: CurrentWeather;
  /** Daily forecasts in chronological order. */
  daily: ForecastDay[];
  /** Time the application received this data, in ISO UTC. */
  retrievedAt: string;
}

export type WeatherSnapshot = WeatherData;

export type RequestErrorKind = 'timeout' | 'network' | 'http' | 'api' | 'invalid-response';

export interface RequestError {
  kind: RequestErrorKind;
  statusCode?: number;
}

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; results: CitySearchResult[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: RequestError };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; location: WeatherLocation }
  | { status: 'success'; snapshot: WeatherSnapshot }
  | {
      status: 'partial';
      snapshot: WeatherSnapshot;
      missingFields: string[];
    }
  | { status: 'error'; location: WeatherLocation; error: RequestError };
