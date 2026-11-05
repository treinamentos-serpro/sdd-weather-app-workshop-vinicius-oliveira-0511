import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-white" id="forecast-heading">
          Previsão para 5 dias
        </h2>
        {forecast.length < 5 && (
          <p className="text-sm text-white/65" role="status">
            Previsão incompleta
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.slice(0, 5).map((forecastDay) => (
          <ForecastCard forecastDay={forecastDay} key={forecastDay.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}
