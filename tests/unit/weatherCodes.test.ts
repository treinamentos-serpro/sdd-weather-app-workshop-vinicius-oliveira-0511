import { describe, expect, it } from 'vitest';
import { getWeatherDescription, getWeatherIcon } from '../../src/lib/weatherCodes';

describe('getWeatherDescription', () => {
  it.each([
    [0, 'Céu limpo'],
    [61, 'Chuva fraca'],
    [95, 'Trovoada'],
  ])('retorna a descrição do código conhecido %s', (code, description) => {
    expect(getWeatherDescription(code)).toBe(description);
  });

  it.each([999, -1, null])('retorna fallback para o código %s', (code) => {
    expect(getWeatherDescription(code)).toBe('Condição indisponível');
  });
});

describe('getWeatherIcon', () => {
  it.each([
    [0, '\u2600\uFE0F'],
    [61, '\uD83C\uDF27\uFE0F'],
  ])('retorna o ícone do código conhecido %s', (code, icon) => {
    expect(getWeatherIcon(code)).toBe(icon);
  });

  it.each([999, -1, null])('retorna o ícone de fallback para %s', (code) => {
    expect(getWeatherIcon(code)).toBe('\u2601\uFE0F');
  });
});
