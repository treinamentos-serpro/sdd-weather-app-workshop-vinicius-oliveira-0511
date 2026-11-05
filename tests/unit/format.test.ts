import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatForecastDay, getShortDate } from '../../src/lib/format';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('formatForecastDay', () => {
  it('retorna Hoje para o índice zero', () => {
    expect(formatForecastDay('2026-11-05', 0)).toBe('Hoje');
  });

  it('retorna Amanhã para o índice um', () => {
    expect(formatForecastDay('2026-11-06', 1)).toBe('Amanhã');
  });

  it.each([
    ['2026-11-07', 2, 'sábado'],
    ['2026-11-08', 3, 'domingo'],
    ['2026-11-09', 4, 'segunda-feira'],
    ['2027-01-01', 2, 'sexta-feira'],
  ])('retorna %s como dia da semana no índice %s', (date, index, weekday) => {
    expect(formatForecastDay(date, index)).toBe(weekday);
  });

  it('preserva a formatação com data quando o índice não é informado', () => {
    expect(formatForecastDay('2026-11-05')).toBe('qui., 05 de nov.');
  });

  it.each([
    '',
    'inválida',
    '05/11/2026',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
  ])('retorna fallback para a data inválida %j', (date) => {
    expect(formatForecastDay(date)).toBe('Data indisponível');
    expect(formatForecastDay(date, 0)).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it.each([
    ['2026-11-05', '05/11'],
    ['2027-01-01', '01/01'],
    ['2026-12-31', '31/12'],
    ['2024-02-29', '29/02'],
  ])('formata %s como %s em pt-BR', (date, expected) => {
    expect(getShortDate(date)).toBe(expected);
  });

  it.each([
    '',
    'inválida',
    '05/11/2026',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
  ])('retorna fallback para a data inválida %j', (date) => {
    expect(getShortDate(date)).toBe('Data indisponível');
  });
});

describe('independência do fuso do ambiente', () => {
  it.each([
    'America/Los_Angeles',
    'Pacific/Auckland',
  ])('preserva a data local quando o ambiente usa %s', (timezone) => {
    vi.stubEnv('TZ', timezone);

    expect(formatForecastDay('2026-11-07', 2)).toBe('sábado');
    expect(getShortDate('2026-11-07')).toBe('07/11');
  });
});
