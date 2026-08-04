import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const APP_TIMEZONE = 'Africa/Kinshasa';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Bornes UTC [start, end) du jour calendaire courant dans le fuseau donné,
 * à partir d'une date de référence (par défaut maintenant).
 */
export function getDayRangeInTimezone(
  timezone: string,
  reference: Date = new Date(),
): { start: Date; end: Date } {
  const dayString = formatInTimeZone(reference, timezone, 'yyyy-MM-dd');
  return getDayRangeForDateString(timezone, dayString);
}

/**
 * Bornes UTC [start, end) pour une date calendaire "YYYY-MM-DD" donnée,
 * interprétée comme un jour du fuseau indiqué.
 */
export function getDayRangeForDateString(
  timezone: string,
  dayString: string,
): { start: Date; end: Date } {
  const start = fromZonedTime(`${dayString}T00:00:00.000`, timezone);
  const end = new Date(start.getTime() + MS_PER_DAY);
  return { start, end };
}
