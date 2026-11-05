import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('fetchWithTimeout', () => {
  it('retorna a resposta e limpa o timer após sucesso', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const response = Response.json({});
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWithTimeout('https://example.com')).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://example.com', {
      signal: expect.any(AbortSignal),
    });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborta após exatamente 10s, converte o erro e limpa o timer', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn(
      (_url: string, options: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchWithTimeout('https://example.com');
    const assertion = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
      statusCode: undefined,
    });
    const signal = fetchMock.mock.calls[0][1].signal;

    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;

    expect(signal?.aborted).toBe(true);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [new TypeError('Failed to fetch'), 'Falha de rede.'],
    [new DOMException('Aborted', 'AbortError'), 'A requisição demorou demais.'],
  ])('converte %s e limpa o timer após rejeição', async (error, message) => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const request = fetchWithTimeout('https://example.com');

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ message });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('searchCities', () => {
  it.fails('normaliza JSON inválido como WeatherServiceError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{', {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(searchCities('Berlin')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.fails('trata erro declarado pela API como falha, não como lista vazia', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          error: true,
          reason: 'Invalid request',
        }),
      ),
    );

    await expect(searchCities('Berlin')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.fails('normaliza resultado de geocoding malformado como WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ results: [null] })));

    await expect(searchCities('Berlin')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each(['', '   ', '\t\n'])('não chama a rede para entrada vazia %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'São Paulo',
    "L'Haÿ-les-Roses",
    'A&B?name=#',
  ])('codifica o nome %s e envia os parâmetros de geocoding', async (name) => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await searchCities(`  ${name}  `);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('mapeia os resultados para City na ordem recebida', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              admin1: 'São Paulo',
              country: 'Brasil',
              country_code: 'BR',
              timezone: 'America/Sao_Paulo',
            },
            { name: 'Outra cidade', latitude: 0, longitude: 0 },
          ],
        }),
      ),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        admin1: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        timezone: 'America/Sao_Paulo',
      },
      {
        id: null,
        name: 'Outra cidade',
        latitude: 0,
        longitude: 0,
        admin1: null,
        country: null,
        countryCode: null,
        timezone: null,
      },
    ]);
  });

  it.each([{}, { results: [] }])('retorna [] sem resultados: %j', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)));

    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it('limita o retorno a dez cidades', async () => {
    const results = Array.from({ length: 11 }, (_, index) => ({
      id: index,
      name: `Cidade ${index}`,
      latitude: 0,
      longitude: 0,
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ results })));

    const cities = await searchCities('Cidade');

    expect(cities.map((city) => city.id)).toEqual(results.slice(0, 10).map((city) => city.id));
  });

  it('lança WeatherServiceError antes de ler o corpo de uma resposta não-ok', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json }));

    const request = searchCities('Berlin');

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ name: 'WeatherServiceError', statusCode: 503 });
    expect(json).not.toHaveBeenCalled();
  });

  it('converte falhas de rede em WeatherServiceError', async () => {
    const error = new TypeError('Falha de rede');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const request = searchCities('Berlin');

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toThrow('Falha de rede.');
  });
});

describe('getWeather', () => {
  const city: City = {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    admin1: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    timezone: null,
  };
  const current = { time: '2026-11-05T12:00', temperature_2m: 20.5, weather_code: 0 };
  const daily = {
    time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'],
    weather_code: [0, 2, 3, 61, 95, 1],
    temperature_2m_min: [10, 11, 12, 13, 14, 15],
    temperature_2m_max: [20, 21, 22, 23, 24, 25],
  };

  it.fails('normaliza JSON inválido do forecast como WeatherServiceError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{', {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.fails('encerra em 10s mesmo quando os cabeçalhos chegam mas o corpo fica pendente', async () => {
    vi.useFakeTimers();
    let resolveBody!: (data: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        const body = new Promise<unknown>((resolve, reject) => {
          resolveBody = resolve;
          options.signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        });
        return Promise.resolve({ ok: true, status: 200, json: () => body });
      }),
    );
    let failure: unknown;
    const request = getWeather(city).catch((error: unknown) => {
      failure = error;
    });

    await vi.advanceTimersByTimeAsync(10_000);
    const failureAtDeadline = failure;
    resolveBody({ current, daily });
    await request;

    expect(failureAtDeadline).toBeInstanceOf(WeatherServiceError);
    expect(failureAtDeadline).toMatchObject({ message: 'A requisição demorou demais.' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.fails('rejeita erro declarado pela API mesmo com campos meteorológicos presentes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          current,
          daily,
          error: true,
          reason: 'Invalid request',
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('envia os parâmetros de forecast e mapeia current e cinco dias por índice', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T16:00:00Z'));
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ timezone: 'America/Sao_Paulo', current, daily }));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.55',
      longitude: '-46.63',
      current: 'temperature_2m,weather_code,precipitation',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      temperature_unit: 'celsius',
      timezone: 'auto',
      forecast_days: '5',
    });
    expect(weather).toEqual({
      location: { ...city, timezone: 'America/Sao_Paulo' },
      current: { temperatureC: 20.5, weatherCode: 0, referenceTime: '2026-11-05T12:00' },
      daily: [
        { date: '2026-11-05', weatherCode: 0, temperatureMinC: 10, temperatureMaxC: 20 },
        { date: '2026-11-06', weatherCode: 2, temperatureMinC: 11, temperatureMaxC: 21 },
        { date: '2026-11-07', weatherCode: 3, temperatureMinC: 12, temperatureMaxC: 22 },
        { date: '2026-11-08', weatherCode: 61, temperatureMinC: 13, temperatureMaxC: 23 },
        { date: '2026-11-09', weatherCode: 95, temperatureMinC: 14, temperatureMaxC: 24 },
      ],
      retrievedAt: '2026-11-05T16:00:00.000Z',
    });
    expect(city.timezone).toBeNull();
  });

  it.each([
    [null, 0],
    [0, 0],
    [1.7, 1.7],
  ])('mapeia precipitação %s para %s mm', async (precipitation, expected) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ current: { ...current, precipitation }, daily })),
    );

    const weather = await getWeather(city);

    expect(weather.current.precipitationMm).toBe(expected);
  });

  it('não inventa precipitação quando o campo está ausente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ current, daily })));

    const weather = await getWeather(city);

    expect(weather.current.precipitationMm).toBeUndefined();
  });

  it.each([
    {},
    null,
    { daily },
    { current },
    { current: null, daily },
    { current, daily: null },
    { current: [], daily },
    { current, daily: {} },
    { current, daily: { time: '2026-11-05' } },
    { current, daily: { time: [null] } },
  ])('lança WeatherServiceError para resposta incompleta: %j', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('preserva datas disponíveis e converte campos ausentes ou inválidos para null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          current: { temperature_2m: '20' },
          daily: {
            time: ['2026-11-05', '2026-11-06'],
            weather_code: [0, null],
            temperature_2m_min: [0],
            temperature_2m_max: ['inválido', -2],
          },
        }),
      ),
    );

    const weather = await getWeather({ ...city, timezone: 'America/Sao_Paulo' });

    expect(weather.current).toEqual({ temperatureC: null, weatherCode: null, referenceTime: null });
    expect(weather.daily).toEqual([
      { date: '2026-11-05', weatherCode: 0, temperatureMinC: 0, temperatureMaxC: null },
      { date: '2026-11-06', weatherCode: null, temperatureMinC: null, temperatureMaxC: -2 },
    ]);
    expect(weather.location.timezone).toBe('America/Sao_Paulo');
  });

  it('aceita arrays opcionais ausentes sem inventar valores', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          current: {},
          daily: { time: ['2026-11-05'] },
        }),
      ),
    );

    expect((await getWeather(city)).daily).toEqual([
      { date: '2026-11-05', weatherCode: null, temperatureMinC: null, temperatureMaxC: null },
    ]);
  });

  it('lança WeatherServiceError para HTTP não-ok sem ler o corpo', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json }));

    const request = getWeather(city);

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ statusCode: 503 });
    expect(json).not.toHaveBeenCalled();
  });

  it('converte falhas de rede em WeatherServiceError', async () => {
    const error = new TypeError('Falha de rede');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const request = getWeather(city);

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toThrow('Falha de rede.');
  });

  it.each([
    ['geocoding', () => searchCities('Berlin')],
    ['forecast', () => getWeather(city)],
  ])('converte AbortError em WeatherServiceError no %s', async (_service, requestWeather) => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));

    const request = requestWeather();

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toThrow('A requisição demorou demais.');
  });
});
