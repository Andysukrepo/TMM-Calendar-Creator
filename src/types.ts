export interface HolidayDef {
  id: string;
  label: string;
  month: number; // 0-indexed
  type: 'bank' | 'special';
  rule: 'fixed' | 'easter' | 'weekday_nth' | 'weekday_last';
  day?: number;
  offset?: number;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday
  n?: number;
}

export interface CustomEvent {
  date: string; // YYYY-MM-DD
  label: string;
}

export interface MoonPhaseMap {
  new: number | null;
  first: number | null;
  full: number | null;
  last: number | null;
}

export interface CalendarEventDisplay {
  type: 'bank' | 'special' | 'custom';
  label: string;
}

export type CalendarLayout = 'grid' | 'vertical-a4' | 'vertical-full' | 'vertical-slim';
export type ArtRatio = 'none' | 'one-third' | 'half';
export type BindingEdge = 'none' | 'top' | 'left';
export type PageSize = 'a4l' | 'a4p' | 'a3p' | 'a3l' | 'a3-full' | 'a3-slim' | 'usl' | 'custom';
export type FileFormat = 'png' | 'pdf' | 'svg-simple' | 'svg-styled';
export type ExportRange = 'single' | 'full-year';
export type TitleAlign = 'left' | 'center' | 'right';
export type DatePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type HeaderStyle = 'short' | 'medium' | 'long';
export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting';

export interface CalendarState {
  month: number; // 0 - 11
  year: number;
  layout: CalendarLayout;
  artRatio: ArtRatio;
  columnNames: string[];
  colCount: number;
  startMonday: boolean;
  datePosition: DatePosition;
  showHeaders: boolean;
  headerStyle: HeaderStyle;

  // Grid styling
  borderWidth: number;
  borderColor: string;
  showGridLines: boolean;
  showWeekNumbers: boolean;
  transparentBg: boolean;

  // Title Typography
  titleFontFamily: string;
  titleSize: number;
  titleFontWeight: number;
  titleAlign: TitleAlign;
  titleColor: string;

  // Dates & Grid Typography
  gridFontFamily: string;
  dateSize: number;
  gridFontWeight: number;
  dateColor: string;
  weekdayColor: string;
  weekendHeaderColor: string;

  // Events & Moon
  enabledEvents: Record<string, boolean>;
  moonPhasesOn: boolean;
  customEvents: CustomEvent[];

  // Export
  pageSize: PageSize;
  customWidth: number;
  customHeight: number;
  fileFormat: FileFormat;
  exportRange: ExportRange;
  includeBleed: boolean;

  // Binding & Punch
  bindingEdge: BindingEdge;
  showPunchGuide: boolean;

  // Artwork
  monthlyImages: (string | null)[];
  useSameArtForAllMonths: boolean;
}
