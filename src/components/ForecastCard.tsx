import { formatForecastDay } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  forecastDay: ForecastDay;
  unit: Unit;
}

function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)}%`;
}

export default function ForecastCard({ forecastDay, unit }: ForecastCardProps) {
  const description = getWeatherDescription(forecastDay.weatherCode);

  return (
    <article
      aria-label={`${formatForecastDay(forecastDay.date)}: ${description}`}
      className="flex min-h-52 flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md"
    >
      <h3 className="text-sm font-medium capitalize text-white/75">
        {formatForecastDay(forecastDay.date)}
      </h3>
      <span aria-hidden="true" className="mt-4 text-4xl">
        {getWeatherIcon(forecastDay.weatherCode)}
      </span>
      <p className="mt-2 min-h-10 text-sm text-white/75">{description}</p>

      <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 pt-4 text-sm">
        <div>
          <dt className="text-white/55">Máx.</dt>
          <dd className="font-semibold">{formatTemperature(forecastDay.temperatureMaxC, unit)}</dd>
        </div>
        <div>
          <dt className="text-white/55">Mín.</dt>
          <dd className="font-medium text-white/80">
            {formatTemperature(forecastDay.temperatureMinC, unit)}
          </dd>
        </div>
        <div className="col-span-2 border-t border-white/10 pt-2">
          <dt className="text-white/55">Prob. de chuva</dt>
          <dd className="font-medium">
            {formatPrecipitationProbability(forecastDay.precipitationProbabilityPercent)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
