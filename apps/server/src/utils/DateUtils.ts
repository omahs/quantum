export function getEndOfDayTimeStamp(): number {
  const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
  const startOfDay = Math.floor(Date.now() / interval) * interval;
  const endOfDay = startOfDay + interval - 1; // 23:59:59:9999

  return endOfDay;
}

/**
 * @param date
 * @returns new date with dd-MM-yyyy format and removes time
 */
export function formatDate(date: Date): Date {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  let month = `${  d.getUTCMonth() + 1}`;
  let day = `${  d.getUTCDate()}`;

  if (month.length < 2) {
    month = `0${  month}`;
  }
  if (day.length < 2) {
    day = `0${  day}`;
  }

  return new Date([year, month, day].join('-'));
}
