import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const city = mockWeatherData.location;
const otherCity: City = { ...city, id: 123, name: 'Outra cidade', latitude: 0, longitude: 0 };
const otherWeather: WeatherData = { ...mockWeatherData, location: otherCity };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

afterEach(cleanup);

describe('useWeather', () => {
  it('inicia idle e retry sem operação não faz chamadas', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('busca cidades e carrega automaticamente o clima da primeira', async () => {
    const weather = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValue(weather.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;

    await act(async () => {
      request = result.current.search(`  ${city.name}  `);
    });

    expect(result.current).toMatchObject({
      status: 'loading',
      query: city.name,
      cities: [city, otherCity],
      data: null,
      error: null,
    });
    expect(searchCities).toHaveBeenCalledExactlyOnceWith(city.name);
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);

    await act(async () => {
      weather.resolve(mockWeatherData);
      await request;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockWeatherData);
  });

  it('retorna empty sem consultar forecast quando não encontra cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Inexistente'));

    expect(result.current).toMatchObject({
      status: 'empty',
      cities: [],
      data: null,
      error: null,
      query: 'Inexistente',
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('não chama services para consulta vazia', async () => {
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search(' \t '));

    expect(result.current.status).toBe('idle');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('seleciona outra cidade preservando a consulta e a lista de resultados', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(city.name));
    vi.mocked(getWeather).mockResolvedValue(otherWeather);

    await act(() => result.current.selectCity(otherCity));

    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      cities: [city, otherCity],
      query: city.name,
    });
    expect(searchCities).toHaveBeenCalledTimes(1);
  });

  it('expõe erro de busca e retry repete a busca completa', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search(city.name));

    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(getWeather).not.toHaveBeenCalled();

    await act(() => result.current.retry());

    expect(searchCities).toHaveBeenNthCalledWith(2, city.name);
    expect(result.current).toMatchObject({ status: 'success', error: null, data: mockWeatherData });
  });

  it('expõe timeout de forecast e retry repete a seleção sem geocoding', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.selectCity(city));

    expect(result.current).toMatchObject({
      status: 'error',
      error: 'A requisição demorou demais.',
      data: null,
    });

    await act(() => result.current.retry());

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current).toMatchObject({ status: 'success', error: null });
  });

  it('retry de busca cujo forecast falhou repete o fluxo completo', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search(city.name));
    await act(() => result.current.retry());

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('ignora resultados antigos de geocoding sem consultar seu forecast', async () => {
    const oldSearch = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(oldSearch.promise);
    vi.mocked(searchCities).mockResolvedValueOnce([otherCity]);
    vi.mocked(getWeather).mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());
    let oldRequest!: Promise<void>;

    act(() => {
      oldRequest = result.current.search(city.name);
    });
    await act(() => result.current.search(otherCity.name));
    await act(async () => {
      oldSearch.resolve([city]);
      await oldRequest;
    });

    expect(getWeather).toHaveBeenCalledExactlyOnceWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      query: otherCity.name,
      cities: [otherCity],
      data: otherWeather,
    });
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignora forecast antigo que termina com %s', async (outcome) => {
    const oldWeather = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(oldWeather.promise);
    vi.mocked(getWeather).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather());
    let oldRequest!: Promise<void>;

    act(() => {
      oldRequest = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(otherCity));
    await act(async () => {
      if (outcome === 'resolve') oldWeather.resolve(mockWeatherData);
      else oldWeather.reject(new WeatherServiceError('Falha de rede.'));
      await oldRequest;
    });

    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
  });

  it('consulta vazia invalida uma operação ainda pendente', async () => {
    const weather = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(weather.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;

    act(() => {
      request = result.current.selectCity(city);
    });
    await act(() => result.current.search(''));
    await act(async () => {
      weather.resolve(mockWeatherData);
      await request;
    });

    expect(result.current).toMatchObject({ status: 'idle', data: null, error: null, cities: [] });
  });
});
