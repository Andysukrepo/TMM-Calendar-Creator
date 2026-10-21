export interface TourStep {
  id: string;
  stepNumber: number;
  durationSeconds: number; // Duration allotted within the 180-second tour
  title: string;
  category: string;
  targetSelector: string; // CSS selector to highlight
  placement: 'right' | 'left' | 'top' | 'bottom' | 'center';
  description: string;
  keyHighlights: string[];
  demoActionLabel?: string;
  demoActionId?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: 1,
    durationSeconds: 20,
    title: 'Welcome to TMM Calendar Creator',
    category: 'Getting Started',
    targetSelector: '.preview-card',
    placement: 'left',
    description:
      'Create bespoke, professional monthly calendars ready for print and digital publishing. The right side features a real-time paper canvas simulation, while the left sidebar gives you complete control over dates, typography, holidays, and page layout.',
    keyHighlights: [
      '3-column modular sidebar controls',
      'Instant WYSIWYG paper simulation preview',
      '12-month quick strip navigation bar'
    ],
    demoActionLabel: '✨ Switch Month in Preview',
    demoActionId: 'cycle_month'
  },
  {
    id: 'dates-layouts',
    stepNumber: 2,
    durationSeconds: 24,
    title: 'Date Selection & Calendar Layouts',
    category: 'Layouts & Grid',
    targetSelector: '#layoutSelect',
    placement: 'right',
    description:
      'Choose your active month and year, switch the week start between Monday and Sunday, and swap calendar layouts between Standard 7-Day Monthly Grid and Vertical Family/Desk Organizers (A4 Full, A3 Full, and A3 Slimline).',
    keyHighlights: [
      'Standard 7-Day monthly grid with custom cell heights',
      'Vertical multi-column organizers with up to 5 family columns',
      'ISO week number calculations'
    ],
    demoActionLabel: '✨ Switch to Vertical A4 Layout',
    demoActionId: 'toggle_vertical'
  },
  {
    id: 'holidays-moon',
    stepNumber: 3,
    durationSeconds: 22,
    title: 'UK Holidays & Moon Phases',
    category: 'Astronomical & Observances',
    targetSelector: '#holidayListContainer',
    placement: 'right',
    description:
      'Built-in astronomical moon phase calculation automatically plots New, First Quarter, Full, and Last Quarter moons. Expand any month to toggle official UK bank holidays (with Easter algorithm offsets) and cultural observances.',
    keyHighlights: [
      'Automatic astronomical moon phase icons',
      'Easter-calculated movable bank holidays (Good Friday, Easter Monday)',
      'Per-holiday individual toggle controls'
    ],
    demoActionLabel: '✨ Toggle Moon Phases',
    demoActionId: 'toggle_moon'
  },
  {
    id: 'custom-events',
    stepNumber: 4,
    durationSeconds: 24,
    title: 'Custom Events & Bulk CSV Upload',
    category: 'Personalization',
    targetSelector: '#customEventsPanel',
    placement: 'right',
    description:
      'Add personal dates, birthdays, company milestones, or product sales directly onto calendar cells. Have a whole schedule? Click "Upload CSV / TXT" to bulk-import hundreds of dates in seconds.',
    keyHighlights: [
      'Quick single-date entry with custom labels',
      'Smart CSV parser supporting ISO (YYYY-MM-DD) and UK (DD/MM/YYYY) formats',
      'Clear individual or all custom events with one click'
    ],
    demoActionLabel: '✨ Add Sample Birthdays',
    demoActionId: 'add_sample_events'
  },
  {
    id: 'typography',
    stepNumber: 5,
    durationSeconds: 24,
    title: 'Typography & 800+ Google Fonts',
    category: 'Style & Fonts',
    targetSelector: '#titleFontStyleSelect',
    placement: 'right',
    description:
      'Express your brand identity! Search over 800+ Google Fonts with live autocomplete for both titles and calendar grid numbers. Customize font weights (300-700), px sizes, header alignments, and custom color accents.',
    keyHighlights: [
      'Live Google Fonts autocomplete & category filters (Serif, Sans, Display, Script)',
      'Independent Title and Date font stylings',
      'Individual color pickers for titles, dates, weekdays, and weekend highlights'
    ],
    demoActionLabel: '✨ Apply Elegant Serif Typography',
    demoActionId: 'apply_serif_font'
  },
  {
    id: 'artwork-split',
    stepNumber: 6,
    durationSeconds: 22,
    title: 'Top Artwork & Split Banners',
    category: 'Artwork & Banners',
    targetSelector: '#artRatioSelect',
    placement: 'right',
    description:
      'Turn your calendar into a classic wall calendar with 1/2 Page Split or a compact 1/3 Page Banner. Upload photography, paintings, or craft headers per month, or replicate a single hero image across all 12 months with 300 DPI dimension hints.',
    keyHighlights: [
      '1/3 Banner (compact) & 1/2 Page Split (classic wall art)',
      'Individual monthly photos or single global image',
      'Exact 300 DPI print dimension guidance per paper size'
    ],
    demoActionLabel: '✨ Enable 1/3 Banner Split',
    demoActionId: 'toggle_art_split'
  },
  {
    id: 'print-binding',
    stepNumber: 7,
    durationSeconds: 22,
    title: 'Print Margins & Wire-O Binding',
    category: 'Print Preparation',
    targetSelector: '#bindingEdgeSelect',
    placement: 'right',
    description:
      'Preparing for coil, spiral, or comb binding? Select Top or Left binding edge offset (+12mm) to ensure your date numbers are never clipped. Enable visual punch hole guides to preview exact hole placements.',
    keyHighlights: [
      '+12mm Wire-O top edge & side binding margin offsets',
      '24-hole top and 18-hole left punch guide overlays',
      'Paper simulation matches real-world binder dimensions'
    ],
    demoActionLabel: '✨ Preview Top Binding & Punch Guides',
    demoActionId: 'toggle_punch_guides'
  },
  {
    id: 'exports-pro',
    stepNumber: 8,
    durationSeconds: 22,
    title: 'High-Res Exports & PRO Activation',
    category: 'Export & Publishing',
    targetSelector: '#downloadBtn',
    placement: 'left',
    description:
      'Export single-month or full 12-month batch PDFs, print-ready transparent PNGs, or resolution-independent SVGs. Activate your PRO license key at any time in the top bar to remove the DEMO watermark and unlock unlimited high-res downloads.',
    keyHighlights: [
      '12-Month Batch PDF generation in a single click',
      'Vector SVG (simple & styled) & 300 DPI PNG outputs',
      'Instant PRO license activation removes DEMO watermark'
    ],
    demoActionLabel: '✨ Activate Pro Preview Mode',
    demoActionId: 'activate_pro_demo'
  }
];

export const TOTAL_TOUR_SECONDS = TOUR_STEPS.reduce((sum, s) => sum + s.durationSeconds, 0); // 180 seconds!
