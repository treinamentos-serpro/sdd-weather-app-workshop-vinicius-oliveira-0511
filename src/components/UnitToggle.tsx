import { useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function selectAndFocus(nextUnit: Unit) {
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
      return;
    }

    fahrenheitButtonRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const currentUnit = event.currentTarget.value as Unit;
    let nextUnit: Unit;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        selectAndFocus(nextUnit);
        break;
      case 'Home':
        event.preventDefault();
        selectAndFocus('celsius');
        break;
      case 'End':
        event.preventDefault();
        selectAndFocus('fahrenheit');
        break;
      default:
        break;
    }
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md"
      role="group"
    >
      <button
        ref={celsiusButtonRef}
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        className={`min-h-11 min-w-11 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'celsius'
            ? 'bg-accent-500 text-white'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => onChange('celsius')}
        onKeyDown={handleKeyDown}
        tabIndex={unit === 'celsius' ? 0 : -1}
        type="button"
        value="celsius"
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        className={`min-h-11 min-w-11 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'fahrenheit'
            ? 'bg-accent-500 text-white'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={handleKeyDown}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        type="button"
        value="fahrenheit"
      >
        °F
      </button>
    </div>
  );
}
