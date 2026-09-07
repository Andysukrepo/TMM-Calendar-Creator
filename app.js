// TMM Calendar Creator – Final Logic

const LICENSE_API_URL = 'https://api.thismanmakes.co.uk/verify-license.php';
const CREATOR_PRODUCT_ID = 'TMM_CALENDAR_CREATOR_PRO';

let isPro = false;

// --- HOLIDAY DATA DEFINITIONS ---
const holidayData = [
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

const state = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  layout: "grid", 
  artRatio: "none", // Options: "none", "one-third", "half"
  columnNames: ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"],
  colCount: 5,
  startMonday: true,
  datePosition: "top-left",
  showHeaders: true,
  headerStyle: "short",
  
  // Style Features
  borderWidth: 1,
  borderColor: "#e5e7eb",
  showGridLines: true, 
  showWeekNumbers: false,
  transparentBg: false,
  
  // Font Colors
  titleColor: "#111827",
  dateColor: "#111827",
  weekdayColor: "#4b5563",
  weekendHeaderColor: "#b91c1c",

  enabledEvents: {}, 
  moonPhasesOn: false,
  customEvents: [],
  
  fontFamily: 'Inter, system-ui, sans-serif',
  titleSize: 32,
  dateSize: 14,
  lineHeight: 1.2,
  letterSpacing: 0,
  fontWeight: 400,
  pageSize: "a4l", 
  fileFormat: "pdf",
  exportRange: "single",
  includeBleed: false,

  // Binding & Punch Guides
  bindingEdge: "none",
  showPunchGuide: false,

  // Artwork Storage (array of 12 images: indices 0..11)
  monthlyImages: Array(12).fill(null),
  useSameArtForAllMonths: false
};

function $(id) { return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", () => {
  holidayData.forEach(h => state.enabledEvents[h.id] = false); 
  state.enabledEvents['jan_newyear'] = true;
  state.enabledEvents['dec_xmas'] = true;
  state.enabledEvents['dec_boxing'] = true;

  renderHolidayControls();
  setupControls();
  renderMonthStrip();
  renderCalendar();
  updateModeUI();
  checkSavedLicense();
  
  document.addEventListener('click', function(event) {
    const sInp = $('fontSearchInput');
    const sRes = $('fontSearchResults');
    if (sInp && sRes && !sInp.contains(event.target) && !sRes.contains(event.target)) {
      sRes.classList.add('hidden');
    }
  });
});

function renderHolidayControls() {
    const container = $("holidayListContainer");
    if (!container) return;
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    
    monthNames.forEach((mName, mIdx) => {
        const eventsInMonth = holidayData.filter(h => h.month === mIdx);
        if(eventsInMonth.length === 0) return;

        const details = document.createElement("details");
        if(mIdx === state.month) details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = mName;
        details.appendChild(summary);

        const content = document.createElement("div");
        content.className = "holiday-month-content";

        eventsInMonth.forEach(ev => {
            const row = document.createElement("div");
            row.className = "holiday-item-row";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `evt_${ev.id}`;
            checkbox.checked = state.enabledEvents[ev.id] || false;
            checkbox.addEventListener("change", (e) => {
                state.enabledEvents[ev.id] = e.target.checked;
                renderCalendar();
            });
            const label = document.createElement("label");
            label.htmlFor = `evt_${ev.id}`;
            label.textContent = ev.label;
            label.style.color = ev.type === 'bank' ? '#b91c1c' : '#7c3aed'; 
            row.appendChild(checkbox);
            row.appendChild(label);
            content.appendChild(row);
        });
        details.appendChild(content);
        container.appendChild(details);
    });
}

function updateArtLabel() {
  const lbl = $("currentArtMonthName");
  if (!lbl) return;
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  lbl.textContent = state.useSameArtForAllMonths ? "All Months" : monthNames[state.month];
}

function updateArtDimensionHint() {
  const hintEl = $("artDimHint");
  if (!hintEl) return;

  const isOneThird = state.artRatio === "one-third";

  if (state.pageSize.startsWith('a3')) {
    hintEl.textContent = isOneThird ? '3508 × 1654 px' : '3508 × 2480 px';
  } else if (state.pageSize.startsWith('us')) {
    hintEl.textContent = isOneThird ? '2550 × 1100 px' : '2550 × 1650 px';
  } else {
    // A4 Default
    hintEl.textContent = isOneThird ? '2480 × 1169 px' : '2480 × 1754 px';
  }
}

function renderMonthStrip() {
  const bar = $("monthStripBar");
  if (!bar) return;
  bar.innerHTML = "";

  const shortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  shortNames.forEach((name, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "strip-btn" + (idx === state.month ? " active" : "") + (state.monthlyImages[idx] ? " has-art" : "");
    btn.title = `Switch to ${name}`;

    const textSpan = document.createElement("span");
    textSpan.textContent = name;
    btn.appendChild(textSpan);

    const dotSpan = document.createElement("span");
    dotSpan.className = "strip-dot";
    btn.appendChild(dotSpan);

    btn.addEventListener("click", () => {
      state.month = idx;
      if ($("monthSelect")) $("monthSelect").value = idx;
      updateArtLabel();
      renderMonthStrip();
      renderCalendar();
    });

    bar.appendChild(btn);
  });
}

function setupControls() {
  const monthSelect = $("monthSelect");
  const yearSelect = $("yearSelect");
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  if (monthSelect) {
    monthNames.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = i; opt.textContent = m;
      monthSelect.appendChild(opt);
    });
    monthSelect.value = state.month;
    monthSelect.addEventListener("change", e => { 
        state.month = parseInt(e.target.value); 
        updateArtLabel();
        renderMonthStrip();
        const accords = document.querySelectorAll("#holidayListContainer details");
        accords.forEach((acc) => {
            const sum = acc.querySelector("summary");
            if(sum && sum.textContent === monthNames[state.month]) acc.open = true;
            else acc.open = false;
        });
        renderCalendar(); 
    });
  }

  if (yearSelect) {
    for (let y = state.year - 1; y <= state.year + 25; y++) {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = state.year;
    yearSelect.addEventListener("change", e => { state.year = parseInt(e.target.value); renderCalendar(); });
  }

  // Layout Selector
  if ($("layoutSelect")) {
    $("layoutSelect").addEventListener("change", e => {
      state.layout = e.target.value;
      const vOpt = $("verticalOptions");
      const gridPos = $("gridSpecificOptions");
      const wrap = document.querySelector(".calendar-wrapper");
      const pageSel = $("pageSizeSelect");

      if (vOpt) vOpt.classList.add("hidden");
      if (gridPos) gridPos.classList.add("hidden");
      if (wrap) wrap.classList.remove("slim-mode");

      if (state.layout === 'vertical-full') {
          if (vOpt) vOpt.classList.remove("hidden");
          if (pageSel) { pageSel.value = "a3-full"; state.pageSize = "a3-full"; }
      } 
      else if (state.layout === 'vertical-a4') {
          if (vOpt) vOpt.classList.remove("hidden");
          if (pageSel) { pageSel.value = "a4p"; state.pageSize = "a4p"; }
      } 
      else if (state.layout === 'vertical-slim') {
          if (wrap) wrap.classList.add("slim-mode");
          if (pageSel) { pageSel.value = "a3-slim"; state.pageSize = "a3-slim"; }
      } 
      else {
          if (gridPos) gridPos.classList.remove("hidden");
          if(pageSel && (state.pageSize.includes('a3-') || state.pageSize === 'a4p')) { 
              pageSel.value="a4l"; state.pageSize="a4l"; 
          }
      }
      updateArtDimensionHint();
      renderCalendar();
    });
  }

  // Artwork Ratio Selector (None, 1/3, 1/2)
  const artRatioSel = $("artRatioSelect");
  if (artRatioSel) {
    artRatioSel.addEventListener("change", e => {
      state.artRatio = e.target.value;
      const splitArt = $("splitArtOptions");
      if (splitArt) {
        if (state.artRatio === "none") splitArt.classList.add("hidden");
        else splitArt.classList.remove("hidden");
      }
      updateArtLabel();
      updateArtDimensionHint();
      renderCalendar();
    });
  }

  // Artwork Upload & Management
  const artInput = $("artImageInput");
  const uploadArtBtn = $("uploadArtBtn");
  const removeArtBtn = $("removeArtBtn");
  const useSameArtToggle = $("useSameArtToggle");

  if (uploadArtBtn && artInput) {
    uploadArtBtn.addEventListener("click", () => artInput.click());

    artInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = evt => {
        const dataUrl = evt.target.result;
        if (state.useSameArtForAllMonths) {
          state.monthlyImages = Array(12).fill(dataUrl);
        } else {
          state.monthlyImages[state.month] = dataUrl;
        }
        renderMonthStrip();
        renderCalendar();
      };
      reader.readAsDataURL(file);
    });
  }

  if (removeArtBtn) {
    removeArtBtn.addEventListener("click", () => {
      if (state.useSameArtForAllMonths) {
        state.monthlyImages = Array(12).fill(null);
      } else {
        state.monthlyImages[state.month] = null;
      }
      if ($("artImageInput")) $("artImageInput").value = "";
      renderMonthStrip();
      renderCalendar();
    });
  }

  if (useSameArtToggle) {
    useSameArtToggle.addEventListener("change", e => {
      state.useSameArtForAllMonths = e.target.checked;
      const currentImg = state.monthlyImages[state.month];
      if (state.useSameArtForAllMonths && currentImg) {
        state.monthlyImages = Array(12).fill(currentImg);
      }
      updateArtLabel();
      renderMonthStrip();
      renderCalendar();
    });
  }

  if ($("colCountSelect")) {
    $("colCountSelect").addEventListener("change", e => {
        state.colCount = parseInt(e.target.value);
        renderCalendar();
    });
  }

  if ($("columnNamesInput")) {
    $("columnNamesInput").addEventListener("input", e => {
        state.columnNames = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
        renderCalendar();
    });
  }

  // Styles Inputs
  if ($("borderWidthInput")) $("borderWidthInput").addEventListener("input", e => { state.borderWidth = e.target.value; renderCalendar(); });
  if ($("borderColorInput")) $("borderColorInput").addEventListener("input", e => { state.borderColor = e.target.value; renderCalendar(); });
  if ($("transparentBgToggle")) $("transparentBgToggle").addEventListener("change", e => { state.transparentBg = e.target.checked; });
  if ($("showGridLinesToggle")) $("showGridLinesToggle").addEventListener("change", e => { state.showGridLines = e.target.checked; renderCalendar(); });
  if ($("moonPhasesToggle")) $("moonPhasesToggle").addEventListener("change", e => { state.moonPhasesOn = e.target.checked; renderCalendar(); });

  const weekNumTog = $("showWeekNumbersToggle");
  if (weekNumTog) {
    weekNumTog.addEventListener("change", e => {
      state.showWeekNumbers = e.target.checked;
      renderCalendar();
    });
  }

  const btnMon = $("btnStartMon");
  const btnSun = $("btnStartSun");

  if (btnMon && btnSun) {
    btnMon.addEventListener("click", () => {
      state.startMonday = true;
      btnMon.classList.add("active");
      btnSun.classList.remove("active");
      renderCalendar();
    });

    btnSun.addEventListener("click", () => {
      state.startMonday = false;
      btnSun.classList.add("active");
      btnMon.classList.remove("active");
      renderCalendar();
    });
  }

  if ($("datePositionSelect")) $("datePositionSelect").addEventListener("change", e => { state.datePosition = e.target.value; renderCalendar(); });
  if ($("headerStyleSelect")) $("headerStyleSelect").addEventListener("change", e => { state.headerStyle = e.target.value; renderCalendar(); });

  // Binding Margin & Punch Guides
  const bindSel = $("bindingEdgeSelect");
  if (bindSel) {
    bindSel.addEventListener("change", e => {
      state.bindingEdge = e.target.value;
      renderCalendar();
    });
  }

  const punchTog = $("showPunchGuideToggle");
  if (punchTog) {
    punchTog.addEventListener("change", e => {
      state.showPunchGuide = e.target.checked;
      renderCalendar();
    });
  }

  // Custom Events Add & Clear
  if ($("addCustomEventBtn")) {
    $("addCustomEventBtn").addEventListener("click", () => {
      const d = $("customEventDate").value;
      const l = $("customEventLabel").value.trim();
      if (!d || !l) return;
      state.customEvents.push({ date: d, label: l });
      $("customEventDate").value = ""; $("customEventLabel").value = "";
      renderCustomEventsList(); renderCalendar();
    });
  }
  if ($("clearCustomEventsBtn")) {
    $("clearCustomEventsBtn").addEventListener("click", () => {
        state.customEvents = []; renderCustomEventsList(); renderCalendar();
    });
  }

  // Bulk CSV Upload
  const csvInput = $("csvFileInput");
  const uploadCsvBtn = $("uploadCsvBtn");

  if (uploadCsvBtn && csvInput) {
    uploadCsvBtn.addEventListener("click", () => csvInput.click());

    csvInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/);
        let addedCount = 0;

        lines.forEach(rawLine => {
          const line = rawLine.trim();
          if (!line) return;

          let delim = ",";
          if (line.includes(";")) delim = ";";
          else if (line.includes("\t")) delim = "\t";

          const parts = line.split(delim).map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length < 2) return;

          let isoDate = null;
          let labelStr = "";

          for (let i = 0; i < parts.length; i++) {
            const token = parts[i];
            const isoMatch = token.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
            if (isoMatch) {
              isoDate = `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
              labelStr = parts.filter((_, pIdx) => pIdx !== i).join(" ");
              break;
            }

            const ukMatch = token.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
            if (ukMatch) {
              isoDate = `${ukMatch[3]}-${String(ukMatch[2]).padStart(2, '0')}-${String(ukMatch[1]).padStart(2, '0')}`;
              labelStr = parts.filter((_, pIdx) => pIdx !== i).join(" ");
              break;
            }
          }

          if (isoDate && labelStr) {
            state.customEvents.push({ date: isoDate, label: labelStr });
            addedCount++;
          }
        });

        csvInput.value = "";
        renderCustomEventsList();
        renderCalendar();
        alert(`Successfully imported ${addedCount} event(s)!`);
      };

      reader.readAsText(file);
    });
  }

  setupFontSearch();
  
  // Colors
  if ($("titleColorInput")) $("titleColorInput").addEventListener("input", e => { state.titleColor = e.target.value; renderCalendar(); });
  if ($("dateColorInput")) $("dateColorInput").addEventListener("input", e => { state.dateColor = e.target.value; renderCalendar(); });
  if ($("weekdayColorInput")) $("weekdayColorInput").addEventListener("input", e => { state.weekdayColor = e.target.value; renderCalendar(); });
  if ($("weekendHeaderColorInput")) $("weekendHeaderColorInput").addEventListener("input", e => { state.weekendHeaderColor = e.target.value; renderCalendar(); });

  if ($("fontWeightSelect")) $("fontWeightSelect").addEventListener("change", e => { state.fontWeight = parseInt(e.target.value); renderCalendar(); });

  if ($("pageSizeSelect")) {
    $("pageSizeSelect").addEventListener("change", e => {
      state.pageSize = e.target.value;
      const customRow = $("customSizeRow");
      if (customRow) customRow.style.display = (state.pageSize === "custom") ? "grid" : "none";
      updateArtDimensionHint();
    });
  }

  const formatSel = $("fileFormatSelect");
  const rangeRow = $("exportRangeRow");
  if (formatSel) {
    formatSel.addEventListener("change", e => { 
      state.fileFormat = e.target.value;
      if (rangeRow) {
        rangeRow.style.display = (e.target.value === 'pdf') ? 'block' : 'none';
      }
    });
  }

  const rangeSel = $("exportRangeSelect");
  if (rangeSel) {
    rangeSel.addEventListener("change", e => {
      state.exportRange = e.target.value;
    });
  }

  if ($("bleedToggle")) $("bleedToggle").addEventListener("change", e => { state.includeBleed = e.target.checked; });
  
  if ($("downloadBtn")) {
    $("downloadBtn").addEventListener("click", () => {
      if(!isPro) return alert("Please activate PRO mode first.");
      handleDownload();
    });
  }

  if ($("activateLicenseBtn")) {
    $("activateLicenseBtn").addEventListener("click", () => {
        const k = $("licenseInput").value.trim();
        if(k) activateLicense(k);
    });
  }
  
  if ($("toggleKeyBtn")) {
    $("toggleKeyBtn").addEventListener("click", () => {
        const input = $("licenseInput");
        const btn = $("toggleKeyBtn");
        if(input.type === "text") {
            input.type = "password";
            btn.textContent = "Show Key";
        } else {
            input.type = "text";
            btn.textContent = "Hide Key";
        }
    });
  }
}

function getISOWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function renderCalendar() {
    const container = $("calendarPreview");
    if(!container) return;
    container.innerHTML = "";

    const wrapper = document.querySelector(".calendar-wrapper");
    if (wrapper) {
      wrapper.classList.remove("binding-top", "binding-left", "has-art-header");
      const oldGuide = wrapper.querySelector(".punch-guide-container");
      if (oldGuide) oldGuide.remove();

      if (state.artRatio !== "none") {
        wrapper.classList.add("has-art-header");
      }

      if (state.bindingEdge === 'top') {
        wrapper.classList.add("binding-top");
      } else if (state.bindingEdge === 'left') {
        wrapper.classList.add("binding-left");
      }

      if (state.showPunchGuide && state.bindingEdge !== 'none') {
        const guide = document.createElement("div");
        guide.className = `punch-guide-container punch-guide-${state.bindingEdge}`;
        const count = state.bindingEdge === 'top' ? 24 : 18;
        for (let i = 0; i < count; i++) {
          const hole = document.createElement("span");
          hole.className = "punch-hole";
          guide.appendChild(hole);
        }
        wrapper.appendChild(guide);
      }
    }

    // Top Artwork Header Rendering (Supports 1/3 and 1/2 ratios)
    if (state.artRatio !== "none") {
      const currentImg = state.monthlyImages[state.month];
      const artZone = document.createElement("div");
      artZone.className = `art-display-zone ratio-${state.artRatio}` + (currentImg ? " has-photo" : "");

      if (currentImg) {
        const imgEl = document.createElement("img");
        imgEl.src = currentImg;
        artZone.appendChild(imgEl);
      } else {
        const phText = document.createElement("span");
        phText.className = "art-placeholder-text";
        const labelText = state.artRatio === "one-third" ? "1/3 Banner Artwork Area" : "1/2 Page Artwork Area";
        phText.innerHTML = `🖼️ <b>${labelText}</b><br>Upload an image or leave blank for a craft illustration area.`;
        artZone.appendChild(phText);
      }
      container.appendChild(artZone);
    }

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    
    const tDiv = document.createElement("div");
    tDiv.style.fontFamily = state.fontFamily;
    tDiv.style.color = state.titleColor;
    tDiv.style.textAlign = "left"; 
    tDiv.style.marginBottom = "14px";
    
    const h2 = document.createElement("h2");
    h2.textContent = `${monthNames[state.month]} ${state.year}`;
    h2.style.fontSize = state.titleSize + "px";
    h2.style.fontWeight = state.fontWeight;
    h2.style.margin = "0";
    tDiv.appendChild(h2);
    container.appendChild(tDiv);

    if (state.layout === 'grid') renderGrid(container);
    else renderVertical(container);
}

function renderGrid(container) {
    container.classList.remove("pos-top-left", "pos-top-right", "pos-bottom-left", "pos-bottom-right");
    container.classList.add("pos-" + state.datePosition);

    const table = document.createElement("table");
    table.className = "calendar-table";
    applyStyles(table);

    const borderStyle = state.showGridLines ? `${state.borderWidth}px solid ${state.borderColor}` : 'none';

    const thead = document.createElement("thead");
    if(state.showHeaders) {
        const tr = document.createElement("tr");
        
        if (state.showWeekNumbers) {
            const thWk = document.createElement("th");
            thWk.className = "th-week-num";
            thWk.textContent = "Wk";
            thWk.style.border = borderStyle;
            tr.appendChild(thWk);
        }

        const headers = getDayHeaders();
        const weekendIndices = state.startMonday ? [5,6] : [0,6];

        headers.forEach((h, i) => {
            const th = document.createElement("th"); 
            th.textContent = h;
            th.style.border = borderStyle;
            th.style.fontWeight = state.fontWeight;
            if(weekendIndices.includes(i)) {
                th.style.color = state.weekendHeaderColor;
            } else {
                th.style.color = state.weekdayColor;
            }
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    }
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const firstDay = new Date(state.year, state.month, 1);
    const lastDay = new Date(state.year, state.month+1, 0);
    
    let startIndex = firstDay.getDay();
    if(state.startMonday) startIndex = (startIndex - 1 + 7) % 7;
    
    const totalCells = Math.ceil((startIndex + lastDay.getDate()) / 7) * 7;
    const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;
    let day = 1;

    for(let i=0; i<totalCells/7; i++) {
        const tr = document.createElement("tr");

        if (state.showWeekNumbers) {
            const tdWk = document.createElement("td");
            tdWk.className = "td-week-num";
            tdWk.style.border = borderStyle;

            let sampleDay = day;
            if (i === 0 && startIndex > 0) sampleDay = 1;
            if (sampleDay <= lastDay.getDate()) {
                const rowDate = new Date(state.year, state.month, sampleDay);
                tdWk.textContent = `W${String(getISOWeekNumber(rowDate)).padStart(2, '0')}`;
            }
            tr.appendChild(tdWk);
        }

        for(let j=0; j<7; j++) {
            const td = document.createElement("td");
            td.style.border = borderStyle; 

            if((i===0 && j<startIndex) || day > lastDay.getDate()) {
                tr.appendChild(td); continue;
            }

            const dateObj = new Date(state.year, state.month, day);
            const iso = dateObj.toISOString().slice(0,10);
            
            const dNum = document.createElement("div");
            dNum.className = "date-number";
            dNum.textContent = day;
            dNum.style.fontWeight = state.fontWeight;
            dNum.style.color = state.dateColor;
            td.appendChild(dNum);

            if(moonMap) {
                const sym = getMoonSymbol(day, moonMap);
                if(sym) {
                    const mIcon = document.createElement("span");
                    mIcon.className = "moon-icon";
                    mIcon.innerHTML = sym;
                    td.appendChild(mIcon);
                }
            }

            const evCont = document.createElement("div");
            evCont.className = "cell-events";
            getEventsForDate(dateObj, iso).forEach(ev => {
                const sp = document.createElement("span");
                sp.textContent = ev.label;
                if(ev.type==="bank") sp.className="event-bank";
                if(ev.type==="special") sp.className="event-special";
                if(ev.type==="custom") sp.className="event-custom";
                sp.style.fontWeight = state.fontWeight;
                evCont.appendChild(sp);
            });
            td.appendChild(evCont);

            tr.appendChild(td);
            day++;
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}

function renderVertical(container) {
    const table = document.createElement("table");
    table.className = "calendar-table vertical-mode";
    applyStyles(table);

    const borderStyle = state.showGridLines ? `${state.borderWidth}px solid ${state.borderColor}` : 'none';

    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    
    const thDate = document.createElement("th"); 
    thDate.textContent = "DATE"; 
    thDate.style.border = borderStyle;
    thDate.style.fontWeight = state.fontWeight;
    tr.appendChild(thDate);
    
    if(state.layout === 'vertical-full' || state.layout === 'vertical-a4') {
        for(let i=0; i < state.colCount; i++) {
            const th = document.createElement("th"); 
            let label = state.columnNames[i];
            if(!label) label = "Name " + (i+1);
            th.textContent = label.toUpperCase(); 
            th.style.border = borderStyle;
            th.style.fontWeight = state.fontWeight;
            tr.appendChild(th);
        }
    } else {
        const th = document.createElement("th"); th.textContent="NOTES"; 
        th.style.border = borderStyle;
        th.style.fontWeight = state.fontWeight;
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const days = new Date(state.year, state.month+1, 0).getDate();
    const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;

    for(let d=1; d<=days; d++) {
        const dateObj = new Date(state.year, state.month, d);
        const iso = dateObj.toISOString().slice(0,10);
        const dayName = dateObj.toLocaleDateString('en-GB', {weekday:'short'});
        const isWknd = (dateObj.getDay()===0 || dateObj.getDay()===6);

        const r = document.createElement("tr");
        if(isWknd) {
            r.classList.add("row-weekend");
        }

        const td1 = document.createElement("td");
        td1.style.border = borderStyle;
        
        let eventHTML = "";
        let moonHTML = "";
        getEventsForDate(dateObj, iso).forEach(ev => {
            let color = "#374151";
            if(ev.type==="bank") color="#b91c1c";
            if(ev.type==="special") color="#7c3aed";
            if(ev.type==="custom") color="#9a3412";
            eventHTML += `<span style="color:${color}; margin-right:6px;">${ev.label}</span>`;
        });

        if(moonMap) {
            const sym = getMoonSymbol(d, moonMap);
            if(sym) moonHTML = `<span style="font-size:14px; margin-left:6px;">${sym}</span>`;
        }

        const dayColor = isWknd ? state.weekendHeaderColor : state.weekdayColor;

        td1.innerHTML = `<div class="vertical-cell-container">
            <div class="v-top-row">
                <span class="v-day-name" style="color:${dayColor}">${dayName}</span>
                <span class="v-day-num" style="color:${state.dateColor}; font-weight:${state.fontWeight}">${String(d).padStart(2,'0')}</span>
            </div>
            <div class="v-bottom-row">
                ${eventHTML}${moonHTML}
            </div>
        </div>`;
        r.appendChild(td1);

        const count = (state.layout === 'vertical-slim') ? 1 : state.colCount;
        for(let k=0; k<count; k++) {
            const td = document.createElement("td");
            td.style.border = borderStyle;
            r.appendChild(td);
        }
        tbody.appendChild(r);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}

// UTILS
function applyStyles(t) {
    t.style.fontFamily = state.fontFamily;
    t.style.color = state.dateColor;
    t.style.fontSize = state.dateSize + "px";
    t.style.fontWeight = state.fontWeight;
}

function getDayHeaders() {
  const s = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const l = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let arr = state.headerStyle === "long" ? l : s;
  if (!state.startMonday) arr = [arr[6], ...arr.slice(0, 6)];
  if(state.headerStyle === "medium") return arr.map(n => n+".");
  return arr;
}

function positionItem(el, extra) {
  el.style.top=""; el.style.right=""; el.style.bottom=""; el.style.left="";
  if(extra){ extra.style.top=""; extra.style.right=""; extra.style.bottom=""; extra.style.left=""; }
  const p = state.datePosition;
  if(p.includes("top")) { el.style.top="4px"; if(extra) extra.style.top="4px"; }
  if(p.includes("bottom")) { el.style.bottom="4px"; if(extra) extra.style.bottom="4px"; }
  if(p.includes("left")) { el.style.left="4px"; if(extra) extra.style.left="24px"; }
  if(p.includes("right")) { el.style.right="4px"; if(extra) extra.style.right="24px"; }
}

function getMoonSymbol(d, map) {
    if(d===map.new) return '<span class="moon-circle moon-new"></span>';
    if(d===map.first) return '<span class="moon-circle moon-first"></span>';
    if(d===map.full) return '<span class="moon-circle moon-full"></span>';
    if(d===map.last) return '<span class="moon-circle moon-last"></span>';
    return null;
}

function getEventsForDate(dateObj, iso) {
  const events = [];
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const d = dateObj.getDate();
  const t = dateObj.getTime();

  holidayData.filter(h => h.month === m).forEach(h => {
      if(!state.enabledEvents[h.id]) return;
      let match = false;
      if(h.rule === 'fixed') { if(d === h.day) match = true; }
      else if(h.rule === 'easter') {
          const easter = getEaster(y);
          const target = new Date(easter);
          target.setDate(easter.getDate() + h.offset);
          if(t === target.getTime()) match = true;
      }
      else if(h.rule === 'weekday_nth') {
          const target = nthWeekdayOfMonth(y, m, h.dayOfWeek, h.n);
          if(t === target.getTime()) match = true;
      }
      else if(h.rule === 'weekday_last') {
          const target = lastWeekdayOfMonth(y, m, h.dayOfWeek);
          if(t === target.getTime()) match = true;
      }
      if(match) events.push({type: h.type, label: h.label});
  });

  state.customEvents.forEach(e => {
      if(e.date === iso) events.push({type:"custom", label:e.label});
  });
  return events;
}

function getEaster(year) {
    const f = Math.floor, G = year % 19, C = f(year/100), H = (C - f(C/4) - f((8*C+13)/25) + 19*G + 15) % 30;
    const I = H - f(H/28)*(1 - f(29/(H+1))*f((21-G)/11)), J = (year + f(year/4) + I + 2 - C + f(C/4)) % 7;
    const L = I - J, m = 3 + f((L + 40)/44), d = L + 28 - 31*f(m/4);
    return new Date(year, m-1, d);
}
function nthWeekdayOfMonth(year, month, weekday, n) {
    const firstDay = new Date(year, month, 1);
    let diff = (weekday - firstDay.getDay() + 7) % 7;
    let date = 1 + diff + (n - 1) * 7;
    return new Date(year, month, date);
}
function lastWeekdayOfMonth(year, month, weekday) {
    const lastDay = new Date(year, month + 1, 0);
    let diff = (lastDay.getDay() - weekday + 7) % 7;
    let date = lastDay.getDate() - diff;
    return new Date(year, month, date);
}
function computeMoonPhaseDays(year, month) {
    const days = new Date(year, month+1, 0).getDate();
    const lp = 2551443;
    const ref = new Date(Date.UTC(1970, 0, 7, 20, 35, 0));
    const res = {new:null, first:null, full:null, last:null};
    const best = {new:1, first:1, full:1, last:1};
    for(let d=1; d<=days; d++) {
        const date = new Date(year, month, d);
        const diff = (date.getTime() - ref.getTime())/1000;
        let f = (diff % lp)/lp; if(f<0) f+=1;
        const check = (k, t) => {
            let dl = Math.abs(f-t); if(dl>0.5) dl=1-dl;
            if(dl<best[k]) { best[k]=dl; res[k]=d; }
        };
        check('new',0); check('first',0.25); check('full',0.5); check('last',0.75);
    }
    return res;
}

// Popular fonts for quick selection
const popularFontsByCategory = {
  "sans-serif": ["Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Inter", "Raleway", "Ubuntu", "Work Sans", "Fira Sans", "Quicksand", "Archivo"],
  "serif": ["Merriweather", "Playfair Display", "Lora", "PT Serif", "Libre Baskerville", "Crimson Text", "Arvo"],
  "display": ["Oswald", "Bebas Neue", "Lobster", "Abril Fatface", "Righteous", "Patua One", "Titan One"],
  "handwriting": ["Dancing Script", "Pacifico", "Caveat", "Satisfy", "Great Vibes", "Sacramento", "Yellowtail"]
};

// Comprehensive Google Fonts Database by Category
const googleFontsByCategory = {
  "sans-serif": [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Oswald", "Source Sans Pro", 
    "Raleway", "PT Sans", "Roboto Condensed", "Nunito", "Rubik", "Mukta", "Arimo", 
    "Noto Sans", "Dosis", "Josefin Sans", "Quicksand", "Cabin", "Inter", "Work Sans", 
    "Karla", "Barlow", "Hind", "Oxygen", "Fira Sans", "Ubuntu", "Mulish", "Manrope",
    "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Outfit", "Red Hat Display", 
    "Lexend", "Archivo", "Figtree", "Sora", "Urbanist", "Albert Sans"
  ],
  "serif": [
    "Merriweather", "PT Serif", "Playfair Display", "Lora", "Libre Baskerville", 
    "Bitter", "Noto Serif", "Crimson Text", "Arvo", "Cardo", "Old Standard TT",
    "Vollkorn", "Spectral", "Cormorant", "Source Serif Pro", "Libre Caslon Text",
    "EB Garamond", "Alegreya", "Crete Round", "Trocchi", "Judson", "Quando",
    "Domine", "Neuton", "Literata", "Lora", "Crimson Pro", "Fraunces"
  ],
  "display": [
    "Righteous", "Bebas Neue", "Alfa Slab One", "Permanent Marker", "Abril Fatface",
    "Paytone One", "Fredoka One", "Passion One", "Bungee", "Black Ops One",
    "Monoton", "Yellowtail", "Lobster", "Fugaz One", "Bangers", "Titan One",
    "Ultra", "Russo One", "Anton", "Rowdies", "Staatliches", "Righteous",
    "Secular One", "Cinzel", "Gruppo", "Audiowide", "Megrim", "Orbitron"
  ],
  "handwriting": [
    "Dancing Script", "Pacifico", "Shadows Into Light", "Indie Flower", 
    "Amatic SC", "Caveat", "Satisfy", "Great Vibes", "Sacramento", "Kaushan Script",
    "Cookie", "Courgette", "Patrick Hand", "Permanent Marker", "Shadows Into Light Two",
    "Nothing You Could Do", "Rock Salt", "Covered By Your Grace", "Gloria Hallelujah",
    "Homemade Apple", "Architects Daughter", "Bad Script", "Sue Ellen Francisco",
    "Handlee", "Damion", "Allura", "Tangerine", "Marck Script"
  ]
};

function setupFontSearch() {
  const styleSelect = $("fontStyleSelect");
  const quickSelect = $("quickFontSelect");
  const inp = $("fontSearchInput");
  const box = $("fontSearchResults");
  if(!inp || !styleSelect || !quickSelect) return;

  let currentCategory = "sans-serif";

  function populateQuickSelect(category) {
    quickSelect.innerHTML = '<option value="">Choose a popular font...</option>';
    const fonts = popularFontsByCategory[category] || [];
    fonts.forEach(font => {
      const opt = document.createElement("option");
      opt.value = font;
      opt.textContent = font;
      quickSelect.appendChild(opt);
    });
  }

  populateQuickSelect(currentCategory);

  styleSelect.addEventListener("change", e => {
    currentCategory = e.target.value;
    populateQuickSelect(currentCategory);
    inp.value = "";
    box.classList.add("hidden");
  });

  quickSelect.addEventListener("change", e => {
    if(e.target.value) {
      applyFont(e.target.value);
      inp.value = e.target.value;
    }
  });

  inp.addEventListener("input", e => {
      const val = e.target.value.toLowerCase(); 
      box.innerHTML="";
      
      if(!val) { box.classList.add("hidden"); return; }

      const fontsToSearch = googleFontsByCategory[currentCategory] || [];

      const useDiv = document.createElement("div"); 
      useDiv.className = "font-result-use"; 
      useDiv.textContent = `Use font: "${e.target.value}"`;
      useDiv.onclick = () => { applyFont(e.target.value); box.classList.add("hidden"); };
      box.appendChild(useDiv);

      fontsToSearch.filter(f => f.toLowerCase().includes(val)).forEach(f => {
          const div = document.createElement("div"); 
          div.textContent = f;
          div.onclick = () => { inp.value = f; applyFont(f); box.classList.add("hidden"); };
          box.appendChild(div);
      });

      box.classList.remove("hidden");
  });
}

function applyFont(name) {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g,'+')}:wght@300;400;600;700&display=swap`;
    link.rel="stylesheet"; document.head.appendChild(link);
    state.fontFamily = `"${name}", sans-serif`;
    renderCalendar();
}

function renderCustomEventsList() {
    const ul = $("customEventList"); 
    if(!ul) return;
    ul.innerHTML = "";
    state.customEvents.forEach((ev, i) => {
        const li = document.createElement("li"); li.innerHTML = `<span>${ev.date}: ${ev.label}</span>`;
        const btn = document.createElement("button"); btn.textContent = "x";
        btn.onclick = () => { state.customEvents.splice(i,1); renderCustomEventsList(); renderCalendar(); };
        li.appendChild(btn); ul.appendChild(li);
    });
}

// --- EXPORT HANDLING ---

function getPDFOrientationAndFormat() {
  const isLandscape = !state.pageSize.endsWith('p');
  let format = 'a4';
  if (state.pageSize.startsWith('a3')) format = 'a3';
  if (state.pageSize.startsWith('us')) format = 'letter';
  return { orientation: isLandscape ? 'landscape' : 'portrait', format };
}

async function renderCanvasForCurrentState() {
  const el = document.querySelector(".calendar-wrapper");
  return await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
}

async function exportSinglePDF() {
  const { jsPDF } = window.jspdf;
  const { orientation, format } = getPDFOrientationAndFormat();
  const pdf = new jsPDF({ orientation, unit: 'mm', format });

  const canvas = await renderCanvasForCurrentState();
  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`calendar-${state.year}-${state.month + 1}.pdf`);
}

async function exportBatchPDF() {
  const { jsPDF } = window.jspdf;
  const { orientation, format } = getPDFOrientationAndFormat();
  const pdf = new jsPDF({ orientation, unit: 'mm', format });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const originalMonth = state.month;
  const downloadBtn = $("downloadBtn");
  const originalText = downloadBtn ? downloadBtn.textContent : "Download calendar";
  if (downloadBtn) downloadBtn.disabled = true;

  try {
    for (let m = 0; m < 12; m++) {
      if (downloadBtn) downloadBtn.textContent = `Generating ${m + 1} of 12...`;
      
      state.month = m;
      if ($("monthSelect")) $("monthSelect").value = m;
      updateArtLabel();
      renderMonthStrip();
      renderCalendar();

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await renderCanvasForCurrentState();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (m > 0) pdf.addPage(format, orientation);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    if (downloadBtn) downloadBtn.textContent = "Saving PDF...";
    pdf.save(`calendar-${state.year}-full-year.pdf`);
  } catch (err) {
    console.error("Batch PDF error:", err);
    alert("Error generating full year PDF. Please check the browser console.");
  } finally {
    state.month = originalMonth;
    if ($("monthSelect")) $("monthSelect").value = originalMonth;
    updateArtLabel();
    renderMonthStrip();
    renderCalendar();
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
    }
  }
}

async function handleDownload() {
  const formatSelect = $("fileFormatSelect");
  const rangeSelect = $("exportRangeSelect");
  const fileFormat = formatSelect ? formatSelect.value : state.fileFormat;
  const exportRange = rangeSelect ? rangeSelect.value : state.exportRange;

  if (fileFormat === 'pdf') {
    if (exportRange === 'full-year') {
      await exportBatchPDF();
    } else {
      await exportSinglePDF();
    }
    return;
  }

  if (fileFormat.includes('svg')) {
    if (state.layout.includes('vertical')) exportVerticalSVG(fileFormat === 'svg-styled');
    else exportGridSVG(fileFormat === 'svg-styled');
    return;
  }

  // PNG Export
  const el = document.querySelector(".calendar-wrapper");
  const originalBg = el.style.backgroundColor;
  if(state.transparentBg) el.style.backgroundColor = "transparent";
  html2canvas(el, {scale:3, backgroundColor: state.transparentBg ? null : "#ffffff"}).then(c => {
      el.style.backgroundColor = originalBg; 
      const a = document.createElement('a'); a.download = `calendar-${state.year}-${state.month+1}.png`;
      a.href = c.toDataURL("image/png"); a.click();
  });
}

function exportVerticalSVG(styled) {
    const isSlim = state.layout === 'vertical-slim';
    const isA4 = state.layout === 'vertical-a4';
    let width, height;
    if(isSlim) { width = 1754; height = 4961; }
    else if(isA4) { width = 2480; height = 3508; } 
    else { width = 3508; height = 4961; } 
    
    const margin = isA4 ? 80 : 120;
    const titleY = margin + (isA4 ? 120 : 150);
    const headerH = isA4 ? 80 : 100;
    const tableTop = titleY + (isA4 ? 80 : 120);
    const dateColW = isA4 ? 400 : 550; 
    const remainingW = width - (margin*2) - dateColW;
    const userColCount = isSlim ? 1 : state.colCount;
    const userColW = remainingW / userColCount;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    if(!state.transparentBg) svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;

    const mNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const title = `${mNames[state.month]} ${state.year}`;
    const tSize = isA4 ? 90 : 120;
    svg += `<text x="${margin}" y="${titleY}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${tSize}" font-weight="${state.fontWeight}" fill="${state.titleColor}">${escapeHtml(title)}</text>`;

    const bW = state.showGridLines ? state.borderWidth : 0;
    const drawCell = (x, y, w, h, text, isHeader=false) => {
        const fs = isA4 ? 28 : 35;
        if(isHeader) {
            if(!state.transparentBg) svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" />`;
            if(state.showGridLines) svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#e5e7eb" stroke-width="${bW}"/>`;
            svg += `<text x="${x + w/2}" y="${y + h/2 + 10}" text-anchor="middle" font-family="sans-serif" font-size="${fs}" font-weight="bold" fill="#666">${escapeHtml(text)}</text>`;
        } else {
            if(state.showGridLines) svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#e5e7eb" stroke-width="${bW}"/>`;
        }
    };

    let curX = margin;
    drawCell(curX, tableTop, dateColW, headerH, "DATE", true);
    curX += dateColW;
    if(isSlim) drawCell(curX, tableTop, userColW, headerH, "NOTES", true);
    else {
        for(let i=0; i<state.colCount; i++) {
            let label = state.columnNames[i] || "Name "+(i+1);
            drawCell(curX, tableTop, userColW, headerH, label.toUpperCase(), true);
            curX += userColW;
        }
    }

    const days = new Date(state.year, state.month+1, 0).getDate();
    const rowH = (height - tableTop - headerH - margin) / days; 
    const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;

    for(let d=1; d<=days; d++) {
        const y = tableTop + headerH + (d-1)*rowH;
        const dateObj = new Date(state.year, state.month, d);
        const iso = dateObj.toISOString().slice(0,10);
        const isWknd = (dateObj.getDay()===0 || dateObj.getDay()===6);
        const dayName = dateObj.toLocaleDateString('en-GB', {weekday:'short'}).toUpperCase();

        const dateTextY = y + rowH/2 + (isA4 ? 12 : 15);
        const dateFS = isA4 ? 32 : 40;
        const dayFS = isA4 ? 24 : 30;
        const textFS = isA4 ? 24 : 30;
        const moonFS = isA4 ? 32 : 40;

        svg += `<text x="${margin + 20}" y="${dateTextY}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${dateFS}" font-weight="bold" fill="${isWknd?'#be123c':'#111827'}">${d}</text>`;
        
        const dColor = isWknd ? state.weekendHeaderColor : state.weekdayColor;
        svg += `<text x="${margin + (isA4?80:90)}" y="${dateTextY}" font-family="sans-serif" font-size="${dayFS}" fill="${dColor}">${dayName}</text>`;

        const events = getEventsForDate(dateObj, iso);
        let evX = margin + (isA4 ? 150 : 180);
        events.forEach(ev => {
            let col = "#374151";
            if(ev.type==="bank") col="#b91c1c";
            if(ev.type==="special") col="#7c3aed";
            if(ev.type==="custom") col="#9a3412";
            svg += `<text x="${evX}" y="${dateTextY}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${textFS}" fill="${col}">${escapeHtml(ev.label)}</text>`;
            evX += (ev.label.length * (isA4 ? 14 : 18)) + 20; 
        });

        if(moonMap) {
            const sym = getMoonSymbol(d, moonMap);
            if(sym) svg += `<text x="${evX}" y="${dateTextY}" font-size="${moonFS}" fill="#333">${sym}</text>`;
        }

        if(state.showGridLines) {
            svg += `<line x1="${margin}" y1="${y+rowH}" x2="${width-margin}" y2="${y+rowH}" stroke="#e5e7eb" stroke-width="${bW}"/>`;
            let lineX = margin + dateColW;
            svg += `<line x1="${lineX}" y1="${y}" x2="${lineX}" y2="${y+rowH}" stroke="#e5e7eb" stroke-width="${bW}"/>`;
            if(!isSlim) {
                for(let c=1; c<state.colCount; c++) {
                    lineX += userColW;
                    svg += `<line x1="${lineX}" y1="${y}" x2="${lineX}" y2="${y+rowH}" stroke="#e5e7eb" stroke-width="${bW}"/>`;
                }
            }
            svg += `<line x1="${margin}" y1="${y}" x2="${margin}" y2="${y+rowH}" stroke="#e5e7eb" stroke-width="${bW}"/>`;
            svg += `<line x1="${width-margin}" y1="${y}" x2="${width-margin}" y2="${y+rowH}" stroke="#e5e7eb" stroke-width="${bW}"/>`;
        }
    }
    svg += `</svg>`;
    downloadSVG(svg, `vertical-${isA4 ? 'a4' : (isSlim?'slim':'full')}`);
}

function exportGridSVG(styled) {
    const dim = getPageDimensions();
    const width = dim.w; const height = dim.h;
    const margin = 120;
    const titleY = margin + 120;
    const headerY = titleY + 100;
    const gridTop = headerY + 60;
    const gridBottom = height - margin - 80; 
    const gridH = gridBottom - gridTop;
    const gridW = width - (margin*2);
    const cols = 7;
    const first = new Date(state.year, state.month, 1);
    const last = new Date(state.year, state.month+1, 0);
    let startIdx = first.getDay();
    if(state.startMonday) startIdx = (startIdx - 1 + 7) % 7;
    const totalCells = Math.ceil((startIdx + last.getDate()) / 7) * 7;
    const rows = totalCells / 7;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    if(!state.transparentBg) svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;

    const mNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const title = `${mNames[state.month]} ${state.year}`;
    svg += `<text x="${width/2}" y="${titleY}" text-anchor="middle" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="100" font-weight="${state.fontWeight}" fill="${state.titleColor}">${escapeHtml(title)}</text>`;

    const bW = state.showGridLines ? state.borderWidth : 0;

    if(state.showHeaders) {
        const headers = getDayHeaders();
        const weekendIndices = state.startMonday ? [5,6] : [0,6];
        headers.forEach((h, i) => {
            const hx = margin + (i * cellW) + (cellW/2);
            let fill = (weekendIndices.includes(i)) ? state.weekendHeaderColor : state.weekdayColor;
            svg += `<text x="${hx}" y="${headerY}" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="bold" fill="${fill}">${h}</text>`;
        });
    }

    const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;
    let day = 1;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const idx = r*7 + c;
            const x = margin + c*cellW;
            const y = gridTop + r*cellH;

            if((r===0 && c<startIdx) || day > last.getDate()) {
                if(state.showGridLines) svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" stroke="#e5e7eb" stroke-width="${bW}"/>`;
                continue;
            }
            
            if(state.showGridLines) {
                if(styled) svg += `<rect x="${x+4}" y="${y+4}" width="${cellW-8}" height="${cellH-8}" rx="10" fill="none" stroke="#e5e7eb" stroke-width="${bW}"/>`;
                else svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" stroke="#e5e7eb" stroke-width="${bW}"/>`;
            }

            const dateObj = new Date(state.year, state.month, day);
            const iso = dateObj.toISOString().slice(0,10);
            const p = state.datePosition; 
            let dateX, dateY, evX, evY, evAnchor;
            const pad = 20; const fsDate = 40; const fsEv = 26;

            if(p.includes('top')) { dateY = y + pad + fsDate; } else { dateY = y + cellH - pad; }
            if(p.includes('left')) { dateX = x + pad; } else { dateX = x + cellW - pad; textAnchor="end"; }
            if(p.includes('top')) { evY = y + cellH - pad; } else { evY = y + pad + fsEv; }
            if(p.includes('right')) { evX = x + cellW - pad; evAnchor="end"; } else { evX = x + pad; evAnchor="start"; }

            svg += `<text x="${dateX}" y="${dateY}" text-anchor="${p.includes('right')?'end':'start'}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${fsDate}" font-weight="${state.fontWeight}" fill="${state.dateColor}">${day}</text>`;

            if(moonMap) {
                const sym = getMoonSymbol(day, moonMap);
                if(sym) {
                    let mx = dateX + (p.includes('right') ? -50 : 50);
                    svg += `<text x="${mx}" y="${dateY}" font-size="30" fill="#333">${sym}</text>`;
                }
            }

            const events = getEventsForDate(dateObj, iso);
            let currentEvY = evY;
            const stackDir = p.includes('top') ? -1 : 1; 
            events.forEach(ev => {
                let col = "#374151";
                if(ev.type==="bank") col="#b91c1c";
                if(ev.type==="special") col="#7c3aed";
                svg += `<text x="${evX}" y="${currentEvY}" text-anchor="${evAnchor}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${fsEv}" fill="${col}">${escapeHtml(ev.label)}</text>`;
                currentEvY += (30 * stackDir);
            });
            day++;
        }
    }
    svg += `</svg>`;
    downloadSVG(svg, 'grid');
}

function getPageDimensions() {
    switch(state.pageSize) {
        case 'a4l': return {w: 3508, h: 2480};
        case 'a4p': return {w: 2480, h: 3508};
        case 'a3l': return {w: 4961, h: 3508};
        case 'a3p': return {w: 3508, h: 4961};
        case 'usl': return {w: 3300, h: 2550}; 
        default: return {w: 3508, h: 2480};
    }
}
function downloadSVG(content, suffix) {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `calendar-${state.year}-${state.month+1}-${suffix}.svg`;
    a.href = url; a.click();
}
function escapeHtml(text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function checkSavedLicense() { const k = localStorage.getItem("tmm_license_key"); if(k) { $("licenseInput").value = k; activateLicense(k, true); } }
async function activateLicense(k, silent) {
    const msg = $("licenseMessage"); 
    const actBtn = $("activateLicenseBtn");
    const statusBadge = $("licenseStatus");
    
    if(!silent) { msg.textContent="Checking..."; msg.className="license-message"; actBtn.disabled=true; }
    try {
        const r = await fetch(LICENSE_API_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({license:k, product_id:CREATOR_PRODUCT_ID}) });
        const d = await r.json();
        if(d.valid) {
            isPro=true; 
            localStorage.setItem("tmm_license_key", k); 
            actBtn.classList.add("hidden"); 
            $("toggleKeyBtn").classList.remove("hidden"); 
            $("licenseInput").type = "password"; 
            
            if(statusBadge) statusBadge.classList.remove("hidden");
            
            msg.textContent="✓ License Activated Successfully!"; 
            msg.className="license-message success";
            
            updateModeUI();
        } else { 
            isPro=false; 
            if(statusBadge) statusBadge.classList.add("hidden");
            if(!silent) { 
                msg.textContent="✗ Invalid license key."; 
                msg.className="license-message error"; 
                actBtn.disabled=false; 
            } 
            updateModeUI(); 
        }
    } catch(e) { 
        console.error(e); 
        if(!silent) { 
            msg.textContent="✗ Error connecting to server."; 
            msg.className="license-message error"; 
            actBtn.disabled=false; 
        } 
    }
}
function updateModeUI() {
    const badge = $("modeBadge");
    const watermark = $("demoWatermark");
    const downloadBtn = $("downloadBtn");
    const hint = $("downloadHint");

    if (isPro) {
        if (badge) { badge.textContent = "PRO MODE"; badge.classList.add("pro"); }
        if (downloadBtn) downloadBtn.classList.remove("disabled");
        if (watermark) watermark.classList.add("hidden");
        if (hint) { 
            hint.textContent = "PRO Active. Ready to download.";
            hint.style.color = "#16a34a";
            hint.style.fontWeight = "600";
        }
    } else {
        if (badge) { badge.textContent = "DEMO MODE"; badge.classList.remove("pro"); }
        if (downloadBtn) downloadBtn.classList.add("disabled");
        if (watermark) watermark.classList.remove("hidden");
        if (hint) { 
            hint.textContent = "Downloads disabled in DEMO MODE.";
            hint.style.color = "";
            hint.style.fontWeight = "";
        }
    }
}
