/** Shared Year → Month → Date grouping for history views (IST calendar). */

export function toIstDateKey(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function parseDateKey(date: string): { year: number; month: number; day: number } {
  const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
  return { year: y, month: m, day: d };
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function dayLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface DateDayGroup<T> {
  date: string;
  dayLabel: string;
  items: T[];
}

export interface DateMonthGroup<T> {
  year: number;
  month: number;
  monthLabel: string;
  days: DateDayGroup<T>[];
}

export interface DateYearGroup<T> {
  year: number;
  months: DateMonthGroup<T>[];
  totalItems: number;
}

/** Group items by Year → Month → Date (newest first). */
export function groupByYearMonthDate<T>(
  items: T[],
  getDateIso: (item: T) => string
): DateYearGroup<T>[] {
  const byDate = new Map<string, T[]>();

  for (const item of items) {
    const key = toIstDateKey(getDateIso(item));
    const list = byDate.get(key) ?? [];
    list.push(item);
    byDate.set(key, list);
  }

  const byYear = new Map<number, Map<number, Map<string, T[]>>>();

  for (const [date, list] of byDate.entries()) {
    const { year, month } = parseDateKey(date);
    if (!byYear.has(year)) byYear.set(year, new Map());
    const byMonth = byYear.get(year)!;
    if (!byMonth.has(month)) byMonth.set(month, new Map());
    byMonth.get(month)!.set(date, list);
  }

  const years: DateYearGroup<T>[] = [];

  for (const year of [...byYear.keys()].sort((a, b) => b - a)) {
    const monthMap = byYear.get(year)!;
    const months: DateMonthGroup<T>[] = [];
    let yearTotal = 0;

    for (const month of [...monthMap.keys()].sort((a, b) => b - a)) {
      const dayMap = monthMap.get(month)!;
      const days: DateDayGroup<T>[] = [];

      for (const date of [...dayMap.keys()].sort((a, b) => b.localeCompare(a))) {
        const dayItems = dayMap
          .get(date)!
          .sort((a, b) => getDateIso(b).localeCompare(getDateIso(a)));
        days.push({ date, dayLabel: dayLabel(date), items: dayItems });
        yearTotal += dayItems.length;
      }

      months.push({
        year,
        month,
        monthLabel: monthLabel(year, month),
        days,
      });
    }

    years.push({ year, months, totalItems: yearTotal });
  }

  return years;
}
