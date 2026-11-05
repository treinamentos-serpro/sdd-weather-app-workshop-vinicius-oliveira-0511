import type { Unit } from '../types/weather';

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function celsiusToFahrenheit(temperatureC: number): number {
  return (temperatureC * 9) / 5 + 32;
}

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(temperatureC) : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = convertTemperature(temperatureC, unit);

  return `${numberFormatter.format(temperature)} ${unitLabel(unit)}`;
}
