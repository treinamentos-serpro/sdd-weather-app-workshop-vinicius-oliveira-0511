import { useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit, WeatherSnapshot } from './types/weather';

function findMissingFields(snapshot: WeatherSnapshot): string[] {
  const missingFields: string[] = [];

  if (snapshot.current.temperatureC === null) {
    missingFields.push('temperatura atual');
  }
  if (snapshot.current.weatherCode === null) {
    missingFields.push('condição atual');
  }
  if (snapshot.daily.length < 5) {
    missingFields.push('previsão de cinco dias');
  }

  snapshot.daily.forEach((day, index) => {
    if (day.weatherCode === null) {
      missingFields.push(`condição do dia ${index + 1}`);
    }
    if (day.temperatureMinC === null) {
      missingFields.push(`mínima do dia ${index + 1}`);
    }
    if (day.temperatureMaxC === null) {
      missingFields.push(`máxima do dia ${index + 1}`);
    }
  });

  return missingFields;
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const searchContainer = useRef<HTMLDivElement>(null);
  const { status, data, cities, error, search, selectCity, retry } = useWeather();

  function renderWeatherState() {
    switch (status) {
      case 'idle':
        return (
          <section className="rounded-lg border border-white/10 bg-white/5 p-6 text-white/70 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Consulte o clima da sua cidade</h2>
          </section>
        );
      case 'loading':
        return <LoadingState message="Carregando clima..." />;
      case 'empty':
        return (
          <EmptyState
            onEditSearch={() => {
              void search('');
              searchContainer.current?.querySelector('input')?.focus();
            }}
          />
        );
      case 'error':
        return (
          <ErrorState
            message={error ?? 'Não foi possível carregar o clima. Tente novamente.'}
            onRetry={() => void retry()}
          />
        );
      case 'success':
        if (!data) return null;
        return (
          <div className="space-y-8">
            {cities.length > 1 && (
              <section aria-labelledby="search-results-heading">
                <h2 className="mb-3 text-lg font-semibold text-white" id="search-results-heading">
                  Selecione uma cidade
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {cities.map((city) => (
                    <li key={city.id ?? `${city.latitude},${city.longitude}`}>
                      <button
                        aria-pressed={
                          city.latitude === data.location.latitude &&
                          city.longitude === data.location.longitude
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                        onClick={() => void selectCity(city)}
                        type="button"
                      >
                        <span className="block font-medium">{city.name}</span>
                        <span className="block text-sm text-white/60">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {findMissingFields(data).length > 0 && (
              <p
                className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/70"
                role="status"
              >
                Alguns dados não estão disponíveis.
              </p>
            )}
            <CurrentWeather city={data.location} current={data.current} unit={unit} />
            <ForecastList forecast={data.daily} unit={unit} />
          </div>
        );
    }
  }

  const isBusy = status === 'loading';

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
          <a
            aria-label="Weather App, início"
            className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            href="/"
          >
            <span aria-hidden="true" className="text-3xl">
              ☁️
            </span>
            <span className="text-lg font-semibold tracking-tight">Weather App</span>
          </a>
          <div
            ref={searchContainer}
            className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center"
          >
            <SearchBar onSearch={(query) => void search(query)} disabled={isBusy} />
            <div className="self-end sm:self-auto">
              <UnitToggle onChange={setUnit} unit={unit} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="sr-only">Previsão do tempo</h1>
        {renderWeatherState()}
      </main>
    </div>
  );
}
