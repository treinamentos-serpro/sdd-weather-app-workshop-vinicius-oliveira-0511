import { expect, test } from '@playwright/test';

const geocodingResponse = {
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
  ],
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-11-05T09:00',
    temperature_2m: 0,
    weather_code: 0,
    precipitation: 0,
  },
  daily: {
    time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [-5, -4, -3, -2, -1],
    temperature_2m_max: [5, 6, 7, 8, 9],
  },
};

test('busca cidade, exibe previsão de cinco dias e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  let geocodingRequests = 0;
  let forecastRequests = 0;

  await page.clock.setFixedTime(new Date('2026-11-05T12:00:00Z'));
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão para 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
  await expect(forecast.getByText('5,0 °C', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(currentWeather.getByText('32,0 °F', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toHaveCount(0);
  await expect(forecast.getByText('41,0 °F', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(geocodingRequests).toBe(1);
  expect(forecastRequests).toBe(1);
});

test('exibe Nenhuma cidade encontrada quando o geocoding retorna sem resultados', async ({
  page,
}) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.route('https://api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar busca' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Buscar cidade' })).toBeEnabled();
  await expect(page.getByRole('region', { name: 'Previsão para 5 dias' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('renderiza o clima após buscar uma cidade no viewport mobile 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.clock.setFixedTime(new Date('2026-11-05T12:00:00Z'));
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: forecastResponse }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('Céu limpo', { exact: true })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão para 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
  expect(page.viewportSize()).toEqual({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
