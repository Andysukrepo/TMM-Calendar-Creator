import { HolidayDef } from '../types';

export const HOLIDAY_DATA: HolidayDef[] = [
  { id: 'jan_newyear', label: "New Year's Day", month: 0, type: 'bank', rule: 'fixed', day: 1 },
  { id: 'jan_burns', label: "Burns Night", month: 0, type: 'special', rule: 'fixed', day: 25 },
  { id: 'feb_val', label: "Valentine's Day", month: 1, type: 'special', rule: 'fixed', day: 14 },
  { id: 'mar_stdavid', label: "St David's Day", month: 2, type: 'special', rule: 'fixed', day: 1 },
  { id: 'mar_pancake', label: "Pancake Day", month: 2, type: 'special', rule: 'easter', offset: -47 },
  { id: 'mar_stpat', label: "St Patrick's Day", month: 2, type: 'special', rule: 'fixed', day: 17 },
  { id: 'mar_mother', label: "Mother's Day", month: 2, type: 'special', rule: 'easter', offset: -21 },
  { id: 'apr_goodfri', label: "Good Friday", month: 3, type: 'bank', rule: 'easter', offset: -2 },
  { id: 'apr_eastermon', label: "Easter Monday", month: 3, type: 'bank', rule: 'easter', offset: 1 },
  { id: 'apr_stgeorge', label: "St George's Day", month: 3, type: 'special', rule: 'fixed', day: 23 },
  { id: 'may_early', label: "Early May Bank Holiday", month: 4, type: 'bank', rule: 'weekday_nth', dayOfWeek: 1, n: 1 },
  { id: 'may_spring', label: "Spring Bank Holiday", month: 4, type: 'bank', rule: 'weekday_last', dayOfWeek: 1 },
  { id: 'jun_father', label: "Father's Day", month: 5, type: 'special', rule: 'weekday_nth', dayOfWeek: 0, n: 3 },
  { id: 'jul_boyne', label: "Battle of the Boyne", month: 6, type: 'special', rule: 'fixed', day: 12 },
  { id: 'jul_boyne_obs', label: "Battle of the Boyne (Obs)", month: 6, type: 'special', rule: 'fixed', day: 14 },
  { id: 'aug_scot', label: "Summer Bank Holiday (Scot)", month: 7, type: 'bank', rule: 'weekday_last', dayOfWeek: 1 },
  { id: 'oct_halloween', label: "Halloween", month: 9, type: 'special', rule: 'fixed', day: 31 },
  { id: 'nov_bonfire', label: "Bonfire Night", month: 10, type: 'special', rule: 'fixed', day: 5 },
  { id: 'nov_remday', label: "Remembrance Day", month: 10, type: 'special', rule: 'fixed', day: 11 },
  { id: 'nov_remsun', label: "Remembrance Sunday", month: 10, type: 'special', rule: 'weekday_nth', dayOfWeek: 0, n: 2 },
  { id: 'nov_standrew', label: "St Andrew's Day", month: 10, type: 'special', rule: 'fixed', day: 30 },
  { id: 'dec_standrew_obs', label: "St Andrew's Day (Obs)", month: 11, type: 'special', rule: 'fixed', day: 1 },
  { id: 'dec_xmas', label: "Christmas Day", month: 11, type: 'bank', rule: 'fixed', day: 25 },
  { id: 'dec_boxing', label: "Boxing Day", month: 11, type: 'bank', rule: 'fixed', day: 26 },
  { id: 'dec_nye', label: "New Year's Eve", month: 11, type: 'bank', rule: 'fixed', day: 31 }
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_SHORT_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
