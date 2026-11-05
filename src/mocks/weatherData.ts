import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  location: {
    id: 2950159,
    name: 'Berlin',
    latitude: 52.52437,
    longitude: 13.41053,
    admin1: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    timezone: 'Europe/Berlin',
  },
  current: {
    temperatureC: 12.4,
    weatherCode: 2,
    referenceTime: '2026-11-05T12:00:00+01:00',
    humidityPercent: 68,
    windSpeedKmh: 12.6,
    precipitationMm: 0,
    pressureHpa: 1015.3,
  },
  daily: [
    {
      date: '2026-11-05',
      weatherCode: 2,
      temperatureMinC: 8.2,
      temperatureMaxC: 14.1,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-11-06',
      weatherCode: 3,
      temperatureMinC: 7.9,
      temperatureMaxC: 13.2,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-11-07',
      weatherCode: 61,
      temperatureMinC: 6.1,
      temperatureMaxC: 11.8,
      precipitationProbabilityPercent: 70,
    },
    {
      date: '2026-11-08',
      weatherCode: 3,
      temperatureMinC: 5.8,
      temperatureMaxC: 12.0,
      precipitationProbabilityPercent: 30,
    },
    {
      date: '2026-11-09',
      weatherCode: 0,
      temperatureMinC: 7.0,
      temperatureMaxC: 14.5,
      precipitationProbabilityPercent: 0,
    },
  ],
  retrievedAt: '2026-11-05T11:00:00.000Z',
};
