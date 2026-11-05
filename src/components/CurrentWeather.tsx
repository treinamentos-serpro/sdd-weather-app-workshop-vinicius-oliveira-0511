import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

function formatReferenceTime(referenceTime: string | null, timezone: string | null): string | null {
  if (!referenceTime || !timezone) {
    return null;
  }

  const timestamp = new Date(referenceTime);
  if (!Number.isFinite(timestamp.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(timestamp);
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherDescription(current.weatherCode);
  const referenceTime = formatReferenceTime(current.referenceTime, city.timezone);
  const isStale = current.referenceTime
    ? Date.now() - new Date(current.referenceTime).getTime() > 60 * 60 * 1000
    : false;

  const metrics = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    {
      label: 'Precipitação',
      value: formatMetric(current.precipitationMm, 'mm'),
    },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="w-full rounded-lg border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/75" id={headingId}>
            Clima atual em {city.name}
          </h2>
          {city.admin1 && city.admin1 !== city.name ? (
            <p className="mt-1 text-sm text-white/55">
              {city.admin1}
              {city.country ? `, ${city.country}` : ''}
            </p>
          ) : city.country ? (
            <p className="mt-1 text-sm text-white/55">{city.country}</p>
          ) : null}
          <p className="mt-3 text-lg text-white/85">{condition}</p>
          {referenceTime && (
            <p className="mt-2 text-sm text-white/60">
              Dados referentes a {referenceTime}
              {isStale && <span className="ml-2 text-sun">Dados desatualizados</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <span aria-hidden="true" className="text-5xl sm:text-6xl">
            {getWeatherIcon(current.weatherCode)}
          </span>
          <p className="text-5xl font-semibold leading-none sm:text-7xl">
            {formatTemperature(current.temperatureC, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-md border border-white/10 bg-night-900/40 p-3" key={metric.label}>
            <dt className="text-sm text-white/60">{metric.label}</dt>
            <dd className="mt-1 text-lg font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
