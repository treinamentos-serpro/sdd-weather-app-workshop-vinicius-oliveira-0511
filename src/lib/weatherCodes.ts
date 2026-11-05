interface WeatherCodePresentation {
  description: string;
  icon: string;
}

const weatherCodePresentations: Record<number, WeatherCodePresentation> = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Nevoeiro', icon: '🌫️' },
  48: { description: 'Nevoeiro com geada', icon: '🌫️' },
  51: { description: 'Garoa fraca', icon: '🌦️' },
  53: { description: 'Garoa moderada', icon: '🌦️' },
  55: { description: 'Garoa intensa', icon: '🌧️' },
  56: { description: 'Garoa congelante fraca', icon: '🌧️' },
  57: { description: 'Garoa congelante intensa', icon: '🌧️' },
  61: { description: 'Chuva fraca', icon: '🌧️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva intensa', icon: '🌧️' },
  66: { description: 'Chuva congelante fraca', icon: '🌧️' },
  67: { description: 'Chuva congelante intensa', icon: '🌧️' },
  71: { description: 'Neve fraca', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve intensa', icon: '❄️' },
  77: { description: 'Grãos de neve', icon: '❄️' },
  80: { description: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { description: 'Pancadas de chuva violentas', icon: '🌧️' },
  85: { description: 'Pancadas de neve fracas', icon: '🌨️' },
  86: { description: 'Pancadas de neve intensas', icon: '❄️' },
  95: { description: 'Trovoada', icon: '⛈️' },
  96: { description: 'Trovoada com granizo fraco', icon: '⛈️' },
  99: { description: 'Trovoada com granizo intenso', icon: '⛈️' },
};

const unavailable: WeatherCodePresentation = {
  description: 'Condição indisponível',
  icon: '☁️',
};

export function getWeatherDescription(weatherCode: number | null): string {
  return weatherCode === null
    ? unavailable.description
    : (weatherCodePresentations[weatherCode]?.description ?? unavailable.description);
}

export function getWeatherIcon(weatherCode: number | null): string {
  return weatherCode === null
    ? unavailable.icon
    : (weatherCodePresentations[weatherCode]?.icon ?? unavailable.icon);
}
