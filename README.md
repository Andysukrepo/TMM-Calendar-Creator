# TMM Calendar Creator

A modern React & TypeScript web application for designing and exporting printable and digital monthly calendars.

## Features

- **Interactive 180-Second Guided Tour**:
  - Built-in 3-minute interactive walkthrough covering dates, vertical family layouts, UK holidays, moon phases, custom events, Google Fonts, split artwork, spiral binding margins, and PDF/PNG exports.
  - Interactive live demonstration triggers per step ("Try it live"), active element spotlight with pulse ring, countdown clock, dual progress bars (total & step), and play/pause/jump controls.
- **Calendar Formats & Layouts**:
  - Standard Monthly Grid (7-column layout with customizable date positioning and header formats).
  - Vertical Family / Multi-Column Organizers (Vertical A4 Full Width, Vertical A3 Full Width, and Vertical A3 Slimline).
  - Configurable week starting day (Monday or Sunday) and optional ISO Week Numbers.
- **UK Holidays & Astronomical Observances**:
  - Full catalog of bank holidays and special cultural observances (fixed date, Easter relative offsets, nth weekday, and last weekday calculations).
  - Moon phases calculation (New Moon, First Quarter, Full Moon, and Last Quarter) with visual indicators.
- **Custom Events & Bulk Import**:
  - Add individual dates and custom event labels.
  - Bulk import events via CSV / TXT files supporting multiple delimiters (comma, semicolon, tab) and date formats (ISO and UK).
- **Typography & Styling**:
  - Separate Title and Grid typography controls with Google Fonts search, font styles (Sans-serif, Serif, Display, Handwriting), weights, font sizes, alignments, and custom color pickers.
  - Border weight, border colors, and grid line toggles.
- **Top Artwork & Split Banners**:
  - Support for 1/3 Page Banner and 1/2 Page Split Classic Wall Calendar layouts.
  - Per-month artwork image upload or single image applied to all 12 months.
  - Dynamic recommended dimensions calculator (at 300 DPI) for chosen page sizes.
- **Print & Binding Ready**:
  - Spiral / Wire-O top edge and side binding margin offsets (+12mm).
  - Optional visual punch hole guide indicators.
- **High-Resolution Exports**:
  - High-res PNG export with transparent or white background and optional 3mm bleed.
  - Single-month or 12-Month Batch PDF generation using `html2canvas` and `jsPDF`.
  - Simple and styled vector SVG exports.
- **Payhip License & Paywall Integration**:
  - 100% managed by Payhip — no custom server or PHP API required.
  - Generates and delivers keys via Payhip checkout at `https://thismanmakes.co.uk/`.
  - Automatic activation via URL parameters (`?license=...`) or manual entry, unlocking full 300 DPI batch exports and removing the DEMO watermark.

## Tech Stack

- React 18 & TypeScript
- Vite
- html2canvas & jsPDF
- Google Fonts API