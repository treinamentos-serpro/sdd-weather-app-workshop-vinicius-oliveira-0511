const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseLocalDate(dateValue: string): Date | null {
  const match = localDatePattern.exec(dateValue);
  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatForecastDay(dateValue: string, index?: number): string {
  const date = parseLocalDate(dateValue);
  if (!date) return 'Data indisponível';

  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  if (index !== undefined) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(date);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export function getShortDate(dateValue: string): string {
  const date = parseLocalDate(dateValue);
  if (!date) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}
