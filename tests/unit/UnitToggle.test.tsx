import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/mocks/weatherData';
import type { Unit } from '../../src/types/weather';

afterEach(cleanup);

function TemperatureExample() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle onChange={setUnit} unit={unit} />
      <CurrentWeather
        city={mockWeatherData.location}
        current={{ ...mockWeatherData.current, temperatureC: 0, referenceTime: null }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle com CurrentWeather', () => {
  it('converte 0 °C para 32 °F ao clicar em Fahrenheit e permite voltar a Celsius', async () => {
    const user = userEvent.setup();
    render(<TemperatureExample />);
    const weather = screen.getByRole('region', {
      name: `Clima atual em ${mockWeatherData.location.name}`,
    });
    const toggle = screen.getByRole('group', { name: 'Unidade de temperatura' });
    const celsius = within(toggle).getByRole('button', { name: 'Celsius' });
    const fahrenheit = within(toggle).getByRole('button', { name: 'Fahrenheit' });

    expect(within(weather).getByText('0,0 °C')).toBeVisible();
    expect(celsius).toHaveAttribute('aria-pressed', 'true');

    await user.click(fahrenheit);

    expect(within(weather).getByText('32,0 °F')).toBeVisible();
    expect(within(weather).queryByText('0,0 °C')).not.toBeInTheDocument();
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
    expect(celsius).toHaveAttribute('aria-pressed', 'false');

    await user.click(celsius);

    expect(within(weather).getByText('0,0 °C')).toBeVisible();
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
  });

  it('permite alternar a unidade pelo teclado', async () => {
    const user = userEvent.setup();
    render(<TemperatureExample />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('region', {
        name: `Clima atual em ${mockWeatherData.location.name}`,
      }),
    ).toHaveTextContent('32,0 °F');
  });
});
