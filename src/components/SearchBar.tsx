import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const [city, setCity] = useState('');
  const normalizedCity = city.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || !normalizedCity) {
      return;
    }

    onSearch(normalizedCity);
  }

  return (
    <form
      aria-label="Buscar cidades"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="mb-2 block text-sm font-medium text-white" htmlFor={inputId}>
        Buscar cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-night-900/70 px-3 py-2 text-white placeholder:text-white/60 focus-visible:border-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          type="search"
          value={city}
        />
        <button
          className="min-h-11 rounded-md bg-accent-500 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || !normalizedCity}
          type="submit"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
