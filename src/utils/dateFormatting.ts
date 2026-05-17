function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatGermanDate(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());

  if (!match) {
    return day;
  }

  return `${match[3]}.${match[2]}.${match[1]}`;
}

export function formatGermanDateTime(timestamp: string): string {
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return `${pad(parsed.getDate())}.${pad(parsed.getMonth() + 1)}.${parsed.getFullYear()}, ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
