import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

interface WeatherHookState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

export function useWeather() {
  const [state, setState] = useState<WeatherHookState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const lastOperation = useRef<Operation | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  async function run(operation: Operation): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = operation;

    if (operation.type === 'search' && !operation.name) {
      setState({ status: 'idle', data: null, cities: [], error: null, query: '' });
      return;
    }

    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      cities: operation.type === 'search' ? [] : previous.cities,
      query: operation.type === 'search' ? operation.name : previous.query,
    }));

    try {
      let city: City;
      if (operation.type === 'search') {
        const cities = await searchCities(operation.name);
        if (currentRequestId !== requestId.current) return;

        if (cities.length === 0) {
          setState((previous) => ({ ...previous, status: 'empty', cities: [] }));
          return;
        }

        setState((previous) => ({ ...previous, cities }));
        city = cities[0];
      } else {
        city = operation.city;
      }

      const data = await getWeather(city);
      if (currentRequestId !== requestId.current) return;

      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (currentRequestId !== requestId.current) return;

      setState((previous) => ({
        ...previous,
        status: 'error',
        error: error instanceof Error ? error.message : 'Não foi possível consultar o clima.',
      }));
    }
  }

  function search(name: string): Promise<void> {
    return run({ type: 'search', name: name.trim() });
  }

  function selectCity(city: City): Promise<void> {
    return run({ type: 'select', city });
  }

  async function retry(): Promise<void> {
    if (lastOperation.current) await run(lastOperation.current);
  }

  return { ...state, search, selectCity, retry };
}

export default useWeather;
