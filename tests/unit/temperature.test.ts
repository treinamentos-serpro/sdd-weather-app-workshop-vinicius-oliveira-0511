import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('celsiusToFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C para %s °F', (celsius, fahrenheit) => {
    expect(celsiusToFahrenheit(celsius)).toBe(fahrenheit);
  });
});

describe('convertTemperature', () => {
  it.each([0, 100, -40, 36.6])('preserva %s quando a unidade é Celsius', (temperature) => {
    expect(convertTemperature(temperature, 'celsius')).toBe(temperature);
  });

  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [36.6, 97.88],
  ])('converte %s para %s quando a unidade é Fahrenheit', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBeCloseTo(fahrenheit, 10);
  });
});

describe('formatTemperature', () => {
  it.each([
    [0, '0,0 °C'],
    [100, '100,0 °C'],
    [-40, '-40,0 °C'],
    [21.24, '21,2 °C'],
    [21.26, '21,3 °C'],
    [1.25, '1,3 °C'],
    [-1.25, '-1,3 °C'],
    [-12.36, '-12,4 °C'],
  ])('formata %s em Celsius com uma casa decimal e símbolo', (temperature, expected) => {
    expect(formatTemperature(temperature, 'celsius')).toBe(expected);
  });

  it.each([
    [0, '32,0 °F'],
    [100, '212,0 °F'],
    [-40, '-40,0 °F'],
    [36.6, '97,9 °F'],
    [-10.26, '13,5 °F'],
    [-0.01, '32,0 °F'],
  ])('converte e formata %s em Fahrenheit com arredondamento e símbolo', (temperature, expected) => {
    expect(formatTemperature(temperature, 'fahrenheit')).toBe(expected);
  });

  describe.each(['celsius', 'fahrenheit'] as const)('valores indisponíveis em %s', (unit) => {
    it.each([
      null,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ])('retorna Indisponível para %s sem inventar temperatura', (temperature) => {
      expect(formatTemperature(temperature, unit)).toBe('Indisponível');
    });
  });
});

describe('unitLabel', () => {
  it('retorna °C para Celsius', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('retorna °F para Fahrenheit', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
