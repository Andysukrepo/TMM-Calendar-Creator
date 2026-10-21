import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CustomEventsPanel } from './components/CustomEventsPanel';
import { DateSelectionPanel } from './components/DateSelectionPanel';
import { ExportPanel } from './components/ExportPanel';
import { GuidedTour } from './components/GuidedTour';
import { Header } from './components/Header';
import { HolidaysPanel } from './components/HolidaysPanel';
import { LayoutGridPanel } from './components/LayoutGridPanel';
import { LicenseBar } from './components/LicenseBar';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { PaywallModal } from './components/PaywallModal';
import { PreviewCard } from './components/PreviewCard';
import { TypographyPanel } from './components/TypographyPanel';
import { ensureGoogleFontLoaded } from './data/fonts';
import { HOLIDAY_DATA } from './data/holidays';
import {
  ArtRatio,
  BindingEdge,
  CalendarLayout,
  CalendarState,
  CustomEvent,
  DatePosition,
  ExportRange,
  FileFormat,
  HeaderStyle,
  PageSize,
  TitleAlign
} from './types';
import { exportGridSVG, exportVerticalSVG } from './utils/svgExport';
import { PAYHIP_STORE_URL, verifyPayhipLicense } from './utils/payhipLicense';

export const App: React.FC = () => {
  const currentDate = new Date();

  // Initialize initial enabled events
  const initialEnabledEvents: Record<string, boolean> = {};
  HOLIDAY_DATA.forEach((h) => {
    initialEnabledEvents[h.id] = false;
  });
  initialEnabledEvents['jan_newyear'] = true;
  initialEnabledEvents['dec_xmas'] = true;
  initialEnabledEvents['dec_boxing'] = true;

  const [state, setState] = useState<CalendarState>({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    layout: 'grid',
    artRatio: 'none',
    columnNames: ['Name 1', 'Name 2', 'Name 3', 'Name 4', 'Name 5'],
    colCount: 5,
    startMonday: true,
    datePosition: 'top-left',
    showHeaders: true,
    headerStyle: 'short',

    borderWidth: 1,
    borderColor: '#e5e7eb',
    showGridLines: true,
    showWeekNumbers: false,
    transparentBg: false,

    titleFontFamily: 'Inter, system-ui, sans-serif',
    titleSize: 32,
    titleFontWeight: 400,
    titleAlign: 'left',
    titleColor: '#111827',

    gridFontFamily: 'Inter, system-ui, sans-serif',
    dateSize: 14,
    gridFontWeight: 400,
    dateColor: '#111827',
    weekdayColor: '#4b5563',
    weekendHeaderColor: '#b91c1c',

    enabledEvents: initialEnabledEvents,
    moonPhasesOn: false,
    customEvents: [],

    pageSize: 'a4l',
    customWidth: 3508,
    customHeight: 2480,
    fileFormat: 'pdf',
    exportRange: 'single',
    includeBleed: false,

    bindingEdge: 'none',
    showPunchGuide: false,

    monthlyImages: Array(12).fill(null),
    useSameArtForAllMonths: false
  });

  const [isPro, setIsPro] = useState<boolean>(false);
  const [licenseChecking, setLicenseChecking] = useState<boolean>(false);
  const [licenseMessage, setLicenseMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | '';
  }>({ text: '', type: '' });

  const [exporting, setExporting] = useState<boolean>(false);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: String(Date.now()), text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Check saved license, URL params, and first-time tour visit on mount
  useEffect(() => {
    // Check URL parameters for license key (e.g. from Payhip redirect: ?license=... or ?key=...)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLicenseKey = urlParams.get('license') || urlParams.get('key');
    if (urlLicenseKey) {
      verifyLicenseKey(urlLicenseKey);
      showToast('Payhip license key detected from URL! Activating...', 'info');
    } else {
      const savedKey = localStorage.getItem('tmm_license_key');
      if (savedKey) {
        verifyLicenseKey(savedKey, true);
      }
    }

    const hasSeenTour = localStorage.getItem('tmm_tour_completed');
    if (!hasSeenTour) {
      const tourTimer = setTimeout(() => {
        showToast('💡 Tip: Click "180s Tour" in the top bar for a 3-minute guided walkthrough!', 'info');
      }, 1500);
      return () => clearTimeout(tourTimer);
    }
  }, []);

  // Interactive Tour Actions
  const handleTourAction = (actionId: string) => {
    switch (actionId) {
      case 'cycle_month':
        setState((p) => ({ ...p, month: (p.month + 1) % 12 }));
        showToast('Switched to next month in preview!', 'info');
        break;

      case 'toggle_vertical':
        handleLayoutChange(state.layout === 'grid' ? 'vertical-a4' : 'grid');
        showToast(
          state.layout === 'grid'
            ? 'Switched to Vertical A4 family layout!'
            : 'Switched back to Standard Grid layout!',
          'info'
        );
        break;

      case 'toggle_moon':
        setState((p) => ({ ...p, moonPhasesOn: !p.moonPhasesOn }));
        showToast(
          !state.moonPhasesOn
            ? 'Moon phases turned ON! Check date cells for phase icons.'
            : 'Moon phases turned OFF.',
          'info'
        );
        break;

      case 'add_sample_events': {
        const monthNumStr = String(state.month + 1).padStart(2, '0');
        const sample1: CustomEvent = {
          date: `${state.year}-${monthNumStr}-12`,
          label: "Mum's Birthday 🎂"
        };
        const sample2: CustomEvent = {
          date: `${state.year}-${monthNumStr}-24`,
          label: 'Autumn Craft Fair 🎨'
        };
        setState((p) => ({
          ...p,
          customEvents: [...p.customEvents, sample1, sample2]
        }));
        showToast('Added sample birthdays and craft fair to calendar!', 'success');
        break;
      }

      case 'apply_serif_font':
        ensureGoogleFontLoaded('Playfair Display');
        setState((p) => ({
          ...p,
          titleFontFamily: '"Playfair Display", serif',
          titleFontWeight: 700,
          titleColor: '#1e293b'
        }));
        showToast('Applied elegant Playfair Display serif font!', 'success');
        break;

      case 'toggle_art_split':
        setState((p) => ({
          ...p,
          artRatio: p.artRatio === 'none' ? 'one-third' : 'none'
        }));
        showToast(
          state.artRatio === 'none'
            ? 'Enabled 1/3 banner artwork header!'
            : 'Disabled top artwork header.',
          'info'
        );
        break;

      case 'toggle_punch_guides':
        setState((p) => ({
          ...p,
          bindingEdge: p.bindingEdge === 'none' ? 'top' : 'none',
          showPunchGuide: !p.showPunchGuide
        }));
        showToast(
          state.bindingEdge === 'none'
            ? 'Enabled Wire-O top edge spiral binding & punch guides!'
            : 'Removed binding edge offset.',
          'info'
        );
        break;

      case 'activate_pro_demo':
        setIsPro((p) => !p);
        showToast(
          !isPro
            ? 'PRO Mode preview activated! DEMO watermark removed.'
            : 'Switched back to DEMO Mode.',
          'success'
        );
        break;

      default:
        break;
    }
  };

  const verifyLicenseKey = async (key: string, silent = false): Promise<boolean> => {
    if (!silent) {
      setLicenseChecking(true);
      setLicenseMessage({ text: 'Verifying with Payhip...', type: 'info' });
    }

    try {
      const result = await verifyPayhipLicense(key);
      if (result.valid) {
        setIsPro(true);
        localStorage.setItem('tmm_license_key', key);
        localStorage.setItem('tmm_is_pro', 'true');
        setLicenseMessage({ text: result.message, type: 'success' });
        setLicenseChecking(false);
        return true;
      } else {
        setIsPro(false);
        localStorage.removeItem('tmm_is_pro');
        if (!silent) {
          setLicenseMessage({ text: result.message, type: 'error' });
        }
        setLicenseChecking(false);
        return false;
      }
    } catch (err) {
      console.error('License error:', err);
      if (!silent) {
        setLicenseMessage({ text: '✗ Error verifying license.', type: 'error' });
      }
      setLicenseChecking(false);
      return false;
    }
  };

  const handleDeactivateLicense = () => {
    localStorage.removeItem('tmm_license_key');
    localStorage.removeItem('tmm_is_pro');
    setIsPro(false);
    setLicenseMessage({ text: 'License cleared. Switched to DEMO mode.', type: 'info' });
    showToast('License cleared! Switched to Demo Mode for testing.', 'info');
  };

  // Layout switcher helper with page size side-effects
  const handleLayoutChange = (newLayout: CalendarLayout) => {
    setState((prev) => {
      let newPageSize = prev.pageSize;
      if (newLayout === 'vertical-full') {
        newPageSize = 'a3-full';
      } else if (newLayout === 'vertical-a4') {
        newPageSize = 'a4p';
      } else if (newLayout === 'vertical-slim') {
        newPageSize = 'a3-slim';
      } else {
        if (prev.pageSize.includes('a3-') || prev.pageSize === 'a4p') {
          newPageSize = 'a4l';
        }
      }
      return {
        ...prev,
        layout: newLayout,
        pageSize: newPageSize
      };
    });
  };

  // Artwork file upload
  const handleUploadArt = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (!dataUrl) return;

      setState((prev) => {
        if (prev.useSameArtForAllMonths) {
          return {
            ...prev,
            monthlyImages: Array(12).fill(dataUrl)
          };
        } else {
          const updated = [...prev.monthlyImages];
          updated[prev.month] = dataUrl;
          return {
            ...prev,
            monthlyImages: updated
          };
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveArt = () => {
    setState((prev) => {
      if (prev.useSameArtForAllMonths) {
        return {
          ...prev,
          monthlyImages: Array(12).fill(null)
        };
      } else {
        const updated = [...prev.monthlyImages];
        updated[prev.month] = null;
        return {
          ...prev,
          monthlyImages: updated
        };
      }
    });
  };

  const handleToggleUseSameArt = (val: boolean) => {
    setState((prev) => {
      const currentImg = prev.monthlyImages[prev.month];
      let newImages = prev.monthlyImages;
      if (val && currentImg) {
        newImages = Array(12).fill(currentImg);
      }
      return {
        ...prev,
        useSameArtForAllMonths: val,
        monthlyImages: newImages
      };
    });
  };

  // PDF orientation & format calculation
  const getPDFOrientationAndFormat = (): {
    orientation: 'portrait' | 'landscape';
    format: string;
  } => {
    const isLandscape = !state.pageSize.endsWith('p');
    let format = 'a4';
    if (state.pageSize.startsWith('a3')) format = 'a3';
    if (state.pageSize.startsWith('us')) format = 'letter';
    return { orientation: isLandscape ? 'landscape' : 'portrait', format };
  };

  const renderCanvasForElement = async (el: HTMLElement) => {
    return await html2canvas(el, {
      scale: 2,
      backgroundColor: state.transparentBg ? null : '#ffffff',
      useCORS: true,
      logging: false
    });
  };

  // Export handlers
  const handleDownload = async () => {
    if (!isPro) {
      showToast('Please activate PRO mode to download.', 'error');
      return;
    }

    const { fileFormat, exportRange } = state;

    if (fileFormat === 'pdf') {
      if (exportRange === 'full-year') {
        await exportBatchPDF();
      } else {
        await exportSinglePDF();
      }
      return;
    }

    if (fileFormat === 'svg-simple') {
      if (state.layout.includes('vertical')) {
        exportVerticalSVG(state, false);
      } else {
        exportGridSVG(state, false);
      }
      showToast('SVG download generated successfully!', 'success');
      return;
    }

    if (fileFormat === 'svg-styled') {
      if (state.layout.includes('vertical')) {
        exportVerticalSVG(state, true);
      } else {
        exportGridSVG(state, true);
      }
      showToast('Styled SVG download generated successfully!', 'success');
      return;
    }

    // PNG Export
    const el = calendarWrapperRef.current;
    if (!el) return;

    try {
      setExporting(true);
      setExportStatusText('Rendering PNG...');
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: state.transparentBg ? null : '#ffffff',
        useCORS: true
      });
      const a = document.createElement('a');
      a.download = `calendar-${state.year}-${state.month + 1}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('PNG downloaded successfully!', 'success');
    } catch (err) {
      console.error('PNG Export failed', err);
      showToast('Failed to generate PNG image.', 'error');
    } finally {
      setExporting(false);
      setExportStatusText('');
    }
  };

  const exportSinglePDF = async () => {
    const el = calendarWrapperRef.current;
    if (!el) return;

    try {
      setExporting(true);
      setExportStatusText('Rendering PDF...');
      const { orientation, format } = getPDFOrientationAndFormat();
      const pdf = new jsPDF({ orientation, unit: 'mm', format });

      const canvas = await renderCanvasForElement(el);
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`calendar-${state.year}-${state.month + 1}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Single PDF Export failed', err);
      showToast('Failed to generate PDF.', 'error');
    } finally {
      setExporting(false);
      setExportStatusText('');
    }
  };

  const exportBatchPDF = async () => {
    const originalMonth = state.month;
    try {
      setExporting(true);
      const { orientation, format } = getPDFOrientationAndFormat();
      const pdf = new jsPDF({ orientation, unit: 'mm', format });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let m = 0; m < 12; m++) {
        setExportStatusText(`Generating ${m + 1} of 12...`);
        // Switch month
        setState((prev) => ({ ...prev, month: m }));
        // Allow DOM to update
        await new Promise((resolve) => setTimeout(resolve, 250));

        const el = calendarWrapperRef.current;
        if (el) {
          const canvas = await renderCanvasForElement(el);
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (m > 0) pdf.addPage(format, orientation);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      setExportStatusText('Saving PDF...');
      pdf.save(`calendar-${state.year}-full-year.pdf`);
      showToast('12-Month full year PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Batch PDF error:', err);
      showToast('Error generating full year PDF.', 'error');
    } finally {
      setState((prev) => ({ ...prev, month: originalMonth }));
      setExporting(false);
      setExportStatusText('');
    }
  };

  return (
    <div className="tmm-app-container">
      <Header
        onStartTour={() => setIsTourOpen(true)}
        isTourActive={isTourOpen}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        isPro={isPro}
      />

      <LicenseBar
        isPro={isPro}
        onActivate={verifyLicenseKey}
        onDeactivate={handleDeactivateLicense}
        checking={licenseChecking}
        message={licenseMessage}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        payhipUrl={PAYHIP_STORE_URL}
      />

      <main className="tmm-main">
        {/* LEFT COLUMN: 3-Column Sidebar */}
        <aside className="tmm-sidebar">
          {/* COLUMN 1: Holidays, Date Selection, Custom Events */}
          <div className="sidebar-col">
            <HolidaysPanel
              moonPhasesOn={state.moonPhasesOn}
              onToggleMoonPhases={(val) => setState((p) => ({ ...p, moonPhasesOn: val }))}
              enabledEvents={state.enabledEvents}
              onToggleEvent={(id, enabled) =>
                setState((p) => ({
                  ...p,
                  enabledEvents: { ...p.enabledEvents, [id]: enabled }
                }))
              }
              activeMonth={state.month}
            />

            <DateSelectionPanel
              month={state.month}
              year={state.year}
              startMonday={state.startMonday}
              onMonthChange={(m) => setState((p) => ({ ...p, month: m }))}
              onYearChange={(y) => setState((p) => ({ ...p, year: y }))}
              onStartMondayChange={(startMon) =>
                setState((p) => ({ ...p, startMonday: startMon }))
              }
            />

            <CustomEventsPanel
              customEvents={state.customEvents}
              onAddEvent={(ev) =>
                setState((p) => ({
                  ...p,
                  customEvents: [...p.customEvents, ev]
                }))
              }
              onRemoveEvent={(idx) =>
                setState((p) => {
                  const arr = [...p.customEvents];
                  arr.splice(idx, 1);
                  return { ...p, customEvents: arr };
                })
              }
              onClearEvents={() => setState((p) => ({ ...p, customEvents: [] }))}
              onBulkAddEvents={(evts) =>
                setState((p) => ({
                  ...p,
                  customEvents: [...p.customEvents, ...evts]
                }))
              }
              onNotify={showToast}
            />
          </div>

          {/* COLUMN 2: Typography & Middle Circular Logo Badge */}
          <TypographyPanel
            titleFontFamily={state.titleFontFamily}
            titleSize={state.titleSize}
            titleFontWeight={state.titleFontWeight}
            titleAlign={state.titleAlign}
            titleColor={state.titleColor}
            onTitleFontFamilyChange={(f) => setState((p) => ({ ...p, titleFontFamily: f }))}
            onTitleSizeChange={(s) => setState((p) => ({ ...p, titleSize: s }))}
            onTitleFontWeightChange={(w) => setState((p) => ({ ...p, titleFontWeight: w }))}
            onTitleAlignChange={(a) => setState((p) => ({ ...p, titleAlign: a }))}
            onTitleColorChange={(c) => setState((p) => ({ ...p, titleColor: c }))}
            gridFontFamily={state.gridFontFamily}
            dateSize={state.dateSize}
            gridFontWeight={state.gridFontWeight}
            dateColor={state.dateColor}
            weekdayColor={state.weekdayColor}
            weekendHeaderColor={state.weekendHeaderColor}
            onGridFontFamilyChange={(f) => setState((p) => ({ ...p, gridFontFamily: f }))}
            onDateSizeChange={(s) => setState((p) => ({ ...p, dateSize: s }))}
            onGridFontWeightChange={(w) => setState((p) => ({ ...p, gridFontWeight: w }))}
            onDateColorChange={(c) => setState((p) => ({ ...p, dateColor: c }))}
            onWeekdayColorChange={(c) => setState((p) => ({ ...p, weekdayColor: c }))}
            onWeekendHeaderColorChange={(c) =>
              setState((p) => ({ ...p, weekendHeaderColor: c }))
            }
          />

          {/* COLUMN 3: Layout & Export */}
          <div className="sidebar-col">
            <LayoutGridPanel
              layout={state.layout}
              onLayoutChange={handleLayoutChange}
              artRatio={state.artRatio}
              onArtRatioChange={(r) => setState((p) => ({ ...p, artRatio: r }))}
              month={state.month}
              monthlyImages={state.monthlyImages}
              useSameArtForAllMonths={state.useSameArtForAllMonths}
              onUploadArt={handleUploadArt}
              onRemoveArt={handleRemoveArt}
              onToggleUseSameArt={handleToggleUseSameArt}
              colCount={state.colCount}
              columnNames={state.columnNames}
              onColCountChange={(cnt) => setState((p) => ({ ...p, colCount: cnt }))}
              onColumnNamesChange={(names) =>
                setState((p) => ({ ...p, columnNames: names }))
              }
              showWeekNumbers={state.showWeekNumbers}
              onShowWeekNumbersChange={(val) =>
                setState((p) => ({ ...p, showWeekNumbers: val }))
              }
              showGridLines={state.showGridLines}
              onShowGridLinesChange={(val) =>
                setState((p) => ({ ...p, showGridLines: val }))
              }
              borderWidth={state.borderWidth}
              onBorderWidthChange={(w) => setState((p) => ({ ...p, borderWidth: w }))}
              borderColor={state.borderColor}
              onBorderColorChange={(c) => setState((p) => ({ ...p, borderColor: c }))}
              datePosition={state.datePosition}
              onDatePositionChange={(pos) =>
                setState((p) => ({ ...p, datePosition: pos }))
              }
              headerStyle={state.headerStyle}
              onHeaderStyleChange={(s) => setState((p) => ({ ...p, headerStyle: s }))}
              bindingEdge={state.bindingEdge}
              onBindingEdgeChange={(edge) =>
                setState((p) => ({ ...p, bindingEdge: edge }))
              }
              showPunchGuide={state.showPunchGuide}
              onShowPunchGuideChange={(val) =>
                setState((p) => ({ ...p, showPunchGuide: val }))
              }
              pageSize={state.pageSize}
            />

            <ExportPanel
              pageSize={state.pageSize}
              onPageSizeChange={(s) => setState((p) => ({ ...p, pageSize: s }))}
              customWidth={state.customWidth}
              customHeight={state.customHeight}
              onCustomWidthChange={(w) => setState((p) => ({ ...p, customWidth: w }))}
              onCustomHeightChange={(h) => setState((p) => ({ ...p, customHeight: h }))}
              fileFormat={state.fileFormat}
              onFileFormatChange={(f) => setState((p) => ({ ...p, fileFormat: f }))}
              exportRange={state.exportRange}
              onExportRangeChange={(r) => setState((p) => ({ ...p, exportRange: r }))}
              transparentBg={state.transparentBg}
              onTransparentBgChange={(val) =>
                setState((p) => ({ ...p, transparentBg: val }))
              }
              includeBleed={state.includeBleed}
              onIncludeBleedChange={(val) =>
                setState((p) => ({ ...p, includeBleed: val }))
              }
              isPro={isPro}
              exporting={exporting}
              exportStatusText={exportStatusText}
              onDownload={handleDownload}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          </div>
        </aside>

        {/* RIGHT COLUMN: Calendar Preview Area */}
        <section className="tmm-preview-area">
          <PreviewCard
            state={state}
            isPro={isPro}
            onSelectMonth={(m) => setState((p) => ({ ...p, month: m }))}
            calendarWrapperRef={calendarWrapperRef}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        </section>
      </main>

      <NotificationToast toast={toast} onDismiss={() => setToast(null)} />

      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          localStorage.setItem('tmm_tour_completed', 'true');
        }}
        onPerformAction={handleTourAction}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        payhipUrl={PAYHIP_STORE_URL}
        onActivate={verifyLicenseKey}
        checking={licenseChecking}
        message={licenseMessage}
      />
    </div>
  );
};
