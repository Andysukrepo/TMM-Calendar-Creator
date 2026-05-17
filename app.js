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
  fileFormat: "png",
  includeBleed: false
};

function $(id) { return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", () => {
  holidayData.forEach(h => state.enabledEvents[h.id] = false); 
  state.enabledEvents['jan_newyear'] = true;
  state.enabledEvents['dec_xmas'] = true;
  state.enabledEvents['dec_boxing'] = true;

  renderHolidayControls();
  setupControls();
  renderCalendar();
  updateModeUI();
  checkSavedLicense();
  
  document.addEventListener('click', function(event) {
    const isClickInside = $('fontSearchInput').contains(event.target) || $('fontSearchResults').contains(event.target);
    if (!isClickInside) {
      $('fontSearchResults').classList.add('hidden');
    }
  });
});

function renderHolidayControls() {
    const container = $("holidayListContainer");
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

function setupControls() {
  const monthSelect = $("monthSelect");
  const yearSelect = $("yearSelect");
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  monthNames.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  for (let y = state.year - 1; y <= state.year + 25; y++) {
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  monthSelect.value = state.month;
  yearSelect.value = state.year;

  monthSelect.addEventListener("change", e => { 
      state.month = parseInt(e.target.value); 
      const accords = document.querySelectorAll("#holidayListContainer details");
      accords.forEach((acc, i) => {
          const sum = acc.querySelector("summary");
          if(sum && sum.textContent === monthNames[state.month]) acc.open = true;
          else acc.open = false;
      });
      renderCalendar(); 
  });
  yearSelect.addEventListener("change", e => { state.year = parseInt(e.target.value); renderCalendar(); });

  $("layoutSelect").addEventListener("change", e => {
    state.layout = e.target.value;
    const vOpt = $("verticalOptions");
    const gridPos = $("gridSpecificOptions");
    const wrap = document.querySelector(".calendar-wrapper");
    const pageSel = $("pageSizeSelect");

    vOpt.classList.add("hidden");
    gridPos.classList.add("hidden");
    wrap.classList.remove("slim-mode");

    if (state.layout === 'vertical-full') {
        vOpt.classList.remove("hidden");
        pageSel.value = "a3-full"; state.pageSize = "a3-full";
    } 
    else if (state.layout === 'vertical-a4') {
        vOpt.classList.remove("hidden");
        pageSel.value = "a4p"; state.pageSize = "a4p"; 
    }
    else if (state.layout === 'vertical-slim') {
        vOpt.classList.add("hidden");
        wrap.classList.add("slim-mode");
        pageSel.value = "a3-slim"; state.pageSize = "a3-slim";
    } 
    else {
        gridPos.classList.remove("hidden");
        if(state.pageSize.includes('a3-') || state.pageSize === 'a4p') { 
            pageSel.value="a4l"; state.pageSize="a4l"; 
        }
    }
    renderCalendar();
  });

  $("colCountSelect").addEventListener("change", e => {
      state.colCount = parseInt(e.target.value);
      renderCalendar();
  });

  $("columnNamesInput").addEventListener("input", e => {
      state.columnNames = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
      renderCalendar();
  });

  // Styles Inputs
  $("borderWidthInput").addEventListener("input", e => { state.borderWidth = e.target.value; renderCalendar(); });
  $("borderColorInput").addEventListener("input", e => { state.borderColor = e.target.value; renderCalendar(); });
  $("transparentBgToggle").addEventListener("change", e => { state.transparentBg = e.target.checked; });
  $("showGridLinesToggle").addEventListener("change", e => { state.showGridLines = e.target.checked; renderCalendar(); });
  $("moonPhasesToggle").addEventListener("change", e => { state.moonPhasesOn = e.target.checked; renderCalendar(); });

  $("startDaySelect").addEventListener("change", e => { state.startMonday = e.target.value === "1"; renderCalendar(); });
  $("datePositionSelect").addEventListener("change", e => { state.datePosition = e.target.value; renderCalendar(); });
  $("headerStyleSelect").addEventListener("change", e => { state.headerStyle = e.target.value; renderCalendar(); });

  $("addCustomEventBtn").addEventListener("click", () => {
    const d = $("customEventDate").value;
    const l = $("customEventLabel").value.trim();
    if (!d || !l) return;
    state.customEvents.push({ date: d, label: l });
    $("customEventDate").value = ""; $("customEventLabel").value = "";
    renderCustomEventsList(); renderCalendar();
  });
  $("clearCustomEventsBtn").addEventListener("click", () => {
      state.customEvents = []; renderCustomEventsList(); renderCalendar();
  });

  setupFontSearch();
  
  // Colors
  $("titleColorInput").addEventListener("input", e => { state.titleColor = e.target.value; renderCalendar(); });
  $("dateColorInput").addEventListener("input", e => { state.dateColor = e.target.value; renderCalendar(); });
  $("weekdayColorInput").addEventListener("input", e => { state.weekdayColor = e.target.value; renderCalendar(); });
  $("weekendHeaderColorInput").addEventListener("input", e => { state.weekendHeaderColor = e.target.value; renderCalendar(); });

  $("fontWeightSelect").addEventListener("change", e => { state.fontWeight = parseInt(e.target.value); renderCalendar(); });

  $("pageSizeSelect").addEventListener("change", e => {
    state.pageSize = e.target.value;
    $("customSizeRow").style.display = (state.pageSize === "custom") ? "grid" : "none";
  });
  $("fileFormatSelect").addEventListener("change", e => { state.fileFormat = e.target.value; });
  $("bleedToggle").addEventListener("change", e => { state.includeBleed = e.target.checked; });
  
  $("downloadBtn").addEventListener("click", () => {
    if(!isPro) return alert("Please activate PRO mode first.");
    handleDownload();
  });

  $("activateLicenseBtn").addEventListener("click", () => {
      const k = $("licenseInput").value.trim();
      if(k) activateLicense(k);
  });
  
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

function renderCalendar() {
    const container = $("calendarPreview");
    if(!container) return;
    container.innerHTML = "";

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    
    const tDiv = document.createElement("div");
    tDiv.style.fontFamily = state.fontFamily;
    tDiv.style.color = state.titleColor;
    tDiv.style.textAlign = "left"; 
    tDiv.style.marginBottom = "20px";
    
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
        const headers = getDayHeaders();
        const weekendIndices = state.startMonday ? [5,6] : [0,6];

        headers.forEach((h, i) => {
            const th = document.createElement("th"); 
            th.textContent = h;
            th.style.border = borderStyle;
            th.style.fontWeight = state.fontWeight;
            // Apply selected colors
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

        // Apply Day Color based on Weekend status
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

// ... EVENT CALCULATORS (getEventsForDate, getEaster, etc. - unchanged) ...
// (Including full helper blocks to ensure file is complete)

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

// ... FONT SEARCH & EXPORT HANDLERS ... (Including setupFontSearch, applyFont, renderCustomEventsList)

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

  // Populate quick select with initial fonts
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

  // Initialize with sans-serif fonts
  populateQuickSelect(currentCategory);

  // Handle font style category change
  styleSelect.addEventListener("change", e => {
    currentCategory = e.target.value;
    populateQuickSelect(currentCategory);
    inp.value = "";
    box.classList.add("hidden");
  });

  // Handle quick select font change
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

      // Get fonts from selected category
      const fontsToSearch = googleFontsByCategory[currentCategory] || [];

      // Add "Use font as typed" option
      const useDiv = document.createElement("div"); 
      useDiv.className = "font-result-use"; 
      useDiv.textContent = `Use font: "${e.target.value}"`;
      useDiv.onclick = () => { applyFont(e.target.value); box.classList.add("hidden"); };
      box.appendChild(useDiv);

      // Filter and show matching fonts
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
    const ul = $("customEventList"); ul.innerHTML = "";
    state.customEvents.forEach((ev, i) => {
        const li = document.createElement("li"); li.innerHTML = `<span>${ev.date}: ${ev.label}</span>`;
        const btn = document.createElement("button"); btn.textContent = "x";
        btn.onclick = () => { state.customEvents.splice(i,1); renderCustomEventsList(); renderCalendar(); };
        li.appendChild(btn); ul.appendChild(li);
    });
}

function handleDownload() {
    if(state.fileFormat.includes('svg')) {
        if(state.layout.includes('vertical')) exportVerticalSVG(state.fileFormat === 'svg-styled');
        else exportGridSVG(state.fileFormat === 'svg-styled');
        return;
    }
    const el = document.querySelector(".calendar-wrapper");
    const originalBg = el.style.backgroundColor;
    if(state.transparentBg) el.style.backgroundColor = "transparent";
    html2canvas(el, {scale:3, backgroundColor: state.transparentBg ? null : "#ffffff"}).then(c => {
        el.style.backgroundColor = originalBg; 
        const a = document.createElement('a'); a.download = `calendar-${state.year}-${state.month+1}.png`;
        a.href = c.toDataURL("image/png"); a.click();
    });
}

// ... SVG EXPORT FUNCTIONS (Updated with colors) ...

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

        // Date Number
        svg += `<text x="${margin + 20}" y="${dateTextY}" font-family="${state.fontFamily.replace(/"/g,"'")}" font-size="${dateFS}" font-weight="bold" fill="${isWknd?'#be123c':'#111827'}">${d}</text>`;
        
        // Day Name (Using specific colors)
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
            
            // Show green ACTIVE badge
            if(statusBadge) statusBadge.classList.remove("hidden");
            
            // Show permanent success message next to show/hide button
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
    // Some UI elements are optional depending on the HTML template.
    const badge = $("modeBadge");        // may not exist
    const watermark = $("demoWatermark");
    const downloadBtn = $("downloadBtn");
    const hint = $("downloadHint");

    if (isPro) {
        if (badge) { badge.textContent = "PRO MODE"; badge.classList.add("pro"); }
        if (downloadBtn) downloadBtn.classList.remove("disabled");
        if (watermark) watermark.classList.add("hidden");
        if (hint) { 
            hint.textContent = "PRO Active. Ready to download.";
            hint.style.color = "#16a34a"; // Green color
            hint.style.fontWeight = "600";
        }
    } else {
        if (badge) { badge.textContent = "DEMO MODE"; badge.classList.remove("pro"); }
        if (downloadBtn) downloadBtn.classList.add("disabled");
        if (watermark) watermark.classList.remove("hidden");
        if (hint) { 
            hint.textContent = "Downloads disabled in DEMO MODE.";
            hint.style.color = ""; // Reset to default
            hint.style.fontWeight = "";
        }
    }
}

