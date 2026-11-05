import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([mockWeatherData.location]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

async function submitSearch() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Berlin');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  return user;
}

describe('App', () => {
  it('inicia idle e sem consultas ou menções a mock', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Consulte o clima da sua cidade' })).toBeVisible();
    expect(screen.queryByText(/mock|dados de exemplo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('mostra loading enquanto aguarda e depois exibe os dados', async () => {
    let resolveSearch!: (cities: City[]) => void;
    vi.mocked(searchCities).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    render(<App />);
    await submitSearch();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando clima...');
    expect(screen.getByRole('searchbox')).toBeDisabled();

    await act(async () => {
      resolveSearch([mockWeatherData.location]);
    });

    expect(await screen.findByRole('heading', { name: 'Clima atual em Berlin' })).toBeVisible();
    expect(screen.queryByText('Carregando clima...')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
  });

  it('mostra empty e permite voltar ao campo de busca', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    render(<App />);
    const user = await submitSearch();

    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeVisible();
    expect(getWeather).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Editar busca' }));

    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Consulte o clima da sua cidade' })).toBeVisible();
  });

  it('mostra o erro do hook e Tentar novamente repete a última busca', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    render(<App />);
    const user = await submitSearch();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Clima atual em Berlin' })).toBeVisible();
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Berlin');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('alterna todas as temperaturas sem novas chamadas e reinicia em Celsius', async () => {
    const { unmount } = render(<App />);
    const user = await submitSearch();
    const currentWeather = await screen.findByRole('region', { name: 'Clima atual em Berlin' });

    expect(within(currentWeather).getByText('12,4 °C')).toBeVisible();
    expect(screen.getByText('14,1 °C')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(within(currentWeather).getByText('54,3 °F')).toBeVisible();
    expect(screen.getByText('57,4 °F')).toBeVisible();
    expect(screen.queryByText(/\d.*°C/)).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);

    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('permite selecionar outra cidade da lista de resultados', async () => {
    const otherCity: City = {
      ...mockWeatherData.location,
      id: 123,
      name: 'Paris',
      latitude: 48.85,
      longitude: 2.35,
    };
    vi.mocked(searchCities).mockResolvedValueOnce([mockWeatherData.location, otherCity]);
    vi.mocked(getWeather).mockResolvedValueOnce(mockWeatherData);
    vi.mocked(getWeather).mockResolvedValueOnce({ ...mockWeatherData, location: otherCity });
    render(<App />);
    const user = await submitSearch();
    await screen.findByRole('heading', { name: 'Clima atual em Berlin' });

    await user.click(screen.getByRole('button', { name: /Paris/ }));

    expect(await screen.findByRole('heading', { name: 'Clima atual em Paris' })).toBeVisible();
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(searchCities).toHaveBeenCalledTimes(1);
  });

  it('preserva o aviso de resposta parcial', async () => {
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      daily: mockWeatherData.daily.slice(0, 2),
    });
    render(<App />);
    await submitSearch();

    expect(await screen.findByText('Alguns dados não estão disponíveis.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Clima atual em Berlin' })).toBeVisible();
  });

  it('mantém a condição válida quando a temperatura atual está ausente', async () => {
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      current: { ...mockWeatherData.current, temperatureC: null, weatherCode: 0 },
    });
    render(<App />);
    const user = await submitSearch();
    const currentWeather = await screen.findByRole('region', { name: 'Clima atual em Berlin' });

    expect(currentWeather).toHaveTextContent('Indisponível');
    expect(currentWeather).toHaveTextContent('Céu limpo');
    expect(within(currentWeather).queryByText('0,0 °C')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(currentWeather).toHaveTextContent('Indisponível');
    expect(within(currentWeather).queryByText('32,0 °F')).not.toBeInTheDocument();
  });

  it('mantém os dados válidos do dia quando a máxima está ausente', async () => {
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      daily: mockWeatherData.daily.map((day, index) =>
        index === 0 ? { ...day, temperatureMaxC: null } : day,
      ),
    });
    render(<App />);
    const user = await submitSearch();
    const forecast = await screen.findByRole('region', { name: 'Previsão para 5 dias' });
    const firstDay = within(forecast).getAllByRole('article')[0];

    expect(firstDay).toHaveTextContent('Indisponível');
    expect(firstDay).toHaveTextContent('Parcialmente nublado');
    expect(within(firstDay).getByText('8,2 °C')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(firstDay).toHaveTextContent('Indisponível');
    expect(within(firstDay).getByText('46,8 °F')).toBeVisible();
  });

  it('não inventa cartões quando a previsão contém menos de cinco datas', async () => {
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      daily: mockWeatherData.daily.slice(0, 2),
    });
    render(<App />);
    await submitSearch();
    const forecast = await screen.findByRole('region', { name: 'Previsão para 5 dias' });

    expect(within(forecast).getAllByRole('article')).toHaveLength(2);
    expect(within(forecast).getByRole('status')).toHaveTextContent('Previsão incompleta');
  });

  it('converte cada mínima e máxima, inclusive negativas, sem alterar os dados originais', async () => {
    const daily = [
      { ...mockWeatherData.daily[0], temperatureMinC: -40, temperatureMaxC: -10 },
      { ...mockWeatherData.daily[1], temperatureMinC: 0, temperatureMaxC: 10 },
      { ...mockWeatherData.daily[2], temperatureMinC: 20, temperatureMaxC: 30 },
      { ...mockWeatherData.daily[3], temperatureMinC: 40, temperatureMaxC: 50 },
      { ...mockWeatherData.daily[4], temperatureMinC: 60, temperatureMaxC: 100 },
    ];
    const snapshot = {
      ...mockWeatherData,
      current: { ...mockWeatherData.current, temperatureC: -40 },
      daily,
    };
    const original = structuredClone(snapshot);
    vi.mocked(getWeather).mockResolvedValueOnce(snapshot);
    render(<App />);
    const user = await submitSearch();
    const forecast = await screen.findByRole('region', { name: 'Previsão para 5 dias' });

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    const expectedTemperatures = [
      ['-40,0 °F', '14,0 °F'],
      ['32,0 °F', '50,0 °F'],
      ['68,0 °F', '86,0 °F'],
      ['104,0 °F', '122,0 °F'],
      ['140,0 °F', '212,0 °F'],
    ];
    within(forecast)
      .getAllByRole('article')
      .forEach((card, index) => {
        for (const temperature of expectedTemperatures[index]) {
          expect(within(card).getByText(temperature)).toBeVisible();
        }
      });
    expect(screen.getByRole('region', { name: 'Clima atual em Berlin' })).toHaveTextContent(
      '-40,0 °F',
    );
    expect(snapshot).toEqual(original);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('oferece retry após falha do forecast e recupera sem manter o erro', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    render(<App />);
    const user = await submitSearch();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(screen.queryByRole('region', { name: 'Clima atual em Berlin' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: 'Clima atual em Berlin' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('omite o horário de referência quando a fonte não o fornece', async () => {
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      current: { ...mockWeatherData.current, referenceTime: null },
    });
    render(<App />);
    await submitSearch();
    const currentWeather = await screen.findByRole('region', { name: 'Clima atual em Berlin' });

    expect(within(currentWeather).queryByText(/Dados referentes a/)).not.toBeInTheDocument();
    expect(within(currentWeather).getByText('12,4 °C')).toBeVisible();
  });

  it.each([
    ['2026-11-05T12:00:00Z', false],
    ['2026-11-05T11:59:59Z', true],
  ])('sinaliza desatualização de %s somente após 60 minutos', async (referenceTime, stale) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T13:00:00Z'));
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      current: { ...mockWeatherData.current, referenceTime },
    });
    render(<App />);
    await submitSearch();
    const currentWeather = await screen.findByRole('region', { name: 'Clima atual em Berlin' });

    expect(within(currentWeather).getByText(/Dados referentes a/)).toBeVisible();
    const warning = within(currentWeather).queryByText('Dados desatualizados');
    if (stale) expect(warning).toBeVisible();
    else expect(warning).not.toBeInTheDocument();
  });

  it.fails('interpreta timestamp sem offset no fuso da cidade e não no fuso do navegador', async () => {
    vi.stubEnv('TZ', 'UTC');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...mockWeatherData,
      location: { ...mockWeatherData.location, timezone: 'America/Sao_Paulo' },
      current: { ...mockWeatherData.current, referenceTime: '2026-11-05T09:00' },
    });
    render(<App />);
    await submitSearch();
    const currentWeather = await screen.findByRole('region', { name: 'Clima atual em Berlin' });

    expect(within(currentWeather).getByText(/Dados referentes a 09:00/)).toBeVisible();
    expect(within(currentWeather).queryByText('Dados desatualizados')).not.toBeInTheDocument();
  });
});
