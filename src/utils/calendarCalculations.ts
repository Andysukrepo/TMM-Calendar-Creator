import { HOLIDAY_DATA } from '../data/holidays';
import { CalendarEventDisplay, CustomEvent, HeaderStyle, MoonPhaseMap, PageSize } from '../types';

export function getEaster(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const m = 3 + f((L + 40) / 44);
  const d = L + 28 - 31 * f(m / 4);
  return new Date(year, m - 1, d);
}

export function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const diff = (weekday - firstDay.getDay() + 7) % 7;
  const date = 1 + diff + (n - 1) * 7;
  return new Date(year, month, date);
}

export function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const diff = (lastDay.getDay() - weekday + 7) % 7;
  const date = lastDay.getDate() - diff;
  return new Date(year, month, date);
}

export function computeMoonPhaseDays(year: number, month: number): MoonPhaseMap {
  const days = new Date(year, month + 1, 0).getDate();
  const lp = 2551443;
  const ref = new Date(Date.UTC(1970, 0, 7, 20, 35, 0));
  const res: MoonPhaseMap = { new: null, first: null, full: null, last: null };
  const best = { new: 1, first: 1, full: 1, last: 1 };

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const diff = (date.getTime() - ref.getTime()) / 1000;
    let f = (diff % lp) / lp;
    if (f < 0) f += 1;

    const check = (k: keyof MoonPhaseMap, t: number) => {
      let dl = Math.abs(f - t);
      if (dl > 0.5) dl = 1 - dl;
      if (dl < best[k]) {
        best[k] = dl;
        res[k] = d;
      }
    };

    check('new', 0);
    check('first', 0.25);
    check('full', 0.5);
    check('last', 0.75);
  }
  return res;
}

export function getMoonPhaseType(day: number, moonMap: MoonPhaseMap | null): 'new' | 'first' | 'full' | 'last' | null {
  if (!moonMap) return null;
  if (day === moonMap.new) return 'new';
  if (day === moonMap.first) return 'first';
  if (day === moonMap.full) return 'full';
  if (day === moonMap.last) return 'last';
  return null;
}

export function getEventsForDate(
  dateObj: Date,
  enabledEvents: Record<string, boolean>,
  customEvents: CustomEvent[]
): CalendarEventDisplay[] {
  const events: CalendarEventDisplay[] = [];
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const d = dateObj.getDate();
  const t = dateObj.getTime();
  const iso = dateObj.toISOString().slice(0, 10);

  HOLIDAY_DATA.filter(h => h.month === m).forEach(h => {
    if (!enabledEvents[h.id]) return;
    let match = false;
    if (h.rule === 'fixed') {
      if (d === h.day) match = true;
    } else if (h.rule === 'easter' && h.offset !== undefined) {
      const easter = getEaster(y);
      const target = new Date(easter);
      target.setDate(easter.getDate() + h.offset);
      if (t === target.getTime()) match = true;
    } else if (h.rule === 'weekday_nth' && h.dayOfWeek !== undefined && h.n !== undefined) {
      const target = nthWeekdayOfMonth(y, m, h.dayOfWeek, h.n);
      if (t === target.getTime()) match = true;
    } else if (h.rule === 'weekday_last' && h.dayOfWeek !== undefined) {
      const target = lastWeekdayOfMonth(y, m, h.dayOfWeek);
      if (t === target.getTime()) match = true;
    }
    if (match) {
      events.push({ type: h.type, label: h.label });
    }
  });

  customEvents.forEach(e => {
    if (e.date === iso) {
      events.push({ type: 'custom', label: e.label });
    }
  });

  return events;
}

export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getDayHeaders(headerStyle: HeaderStyle, startMonday: boolean): string[] {
  const shortNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const longNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let arr = headerStyle === "long" ? longNames : shortNames;
  if (!startMonday) {
    arr = [arr[6], ...arr.slice(0, 6)];
  }
  if (headerStyle === "medium") {
    return arr.map(n => n + ".");
  }
  return arr;
}

export function getPageDimensions(pageSize: PageSize, customWidth = 3508, customHeight = 2480): { w: number; h: number } {
  switch (pageSize) {
    case 'a4l': return { w: 3508, h: 2480 };
    case 'a4p': return { w: 2480, h: 3508 };
    case 'a3l': return { w: 4961, h: 3508 };
    case 'a3p': return { w: 3508, h: 4961 };
    case 'a3-full': return { w: 3508, h: 4961 };
    case 'a3-slim': return { w: 1754, h: 4961 };
    case 'usl': return { w: 3300, h: 2550 };
    case 'custom': return { w: customWidth, h: customHeight };
    default: return { w: 3508, h: 2480 };
  }
}
