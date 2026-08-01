/**
 * TaghvimSinaApp - Main Application Controller
 * Coordinates UI views, event handlers, countdown timer, and modal interactions.
 */

class TaghvimSinaApp {
  constructor() {
    // Initialize Core Modules
    this.calendar = new CalendarEngine();
    this.settingsManager = new SettingsManager();
    this.shiftCalc = new ShiftCalculator(this.settingsManager.settings);
    this.notesManager = new NotesManager();
    this.converter = new DateConverterUI(this.calendar, this.shiftCalc);
    this.reportEngine = new ReportEngine(this.calendar, this.shiftCalc, this.notesManager, this.settingsManager);

    // Current State
    const todayG = new Date();
    const todayJ = this.calendar.g2j(todayG.getFullYear(), todayG.getMonth() + 1, todayG.getDate());
    this.viewYear = todayJ.jy;
    this.viewMonth = todayJ.jm;
    this.selectedTeam = 1;
    this.selectedDateForNote = this.calendar.formatJalali(todayJ.jy, todayJ.jm, todayJ.jd);

    // Bootstrap Modal Instances
    this.dayDetailModal = null;
    this.noteModal = null;
    this.importBackupModal = null;

    // Deferred PWA Install Prompt
    this.deferredPrompt = null;
  }

  /**
   * Initializes the Application
   */
  init() {
    console.log('[TaghvimSinaApp] Initializing app...');

    // Initialize Bootstrap Modals
    const dayModalEl = document.getElementById('dayDetailModal');
    if (dayModalEl) this.dayDetailModal = new bootstrap.Modal(dayModalEl);

    const noteModalEl = document.getElementById('noteModal');
    if (noteModalEl) this.noteModal = new bootstrap.Modal(noteModalEl);

    const importModalEl = document.getElementById('importBackupModal');
    if (importModalEl) this.importBackupModal = new bootstrap.Modal(importModalEl);

    // Setup Event Listeners
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupCalendarControls();
    this.setupTeamTabs();
    this.setupConverterInputs();
    this.setupSearch();
    this.setupNotes();
    this.setupReportsAndBackup();
    this.setupSettingsForm();
    this.setupPWA();

    // Render Initial Views
    this.renderDashboard();
    this.renderCalendar();
    this.renderTeamsView();
    this.renderConverterView();
    this.renderNotesView();

    // Start Live Countdown Interval
    this.startCountdownTimer();
  }

  /**
   * Register Tab Navigation
   */
  setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-item-btn');
    navBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-target');
        this.switchView(targetView);

        navBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /**
   * Switch Active View
   * @param {string} viewName
   */
  switchView(viewName) {
    const views = document.querySelectorAll('.app-view');
    views.forEach((v) => v.classList.add('d-none'));

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) targetEl.classList.remove('d-none');

    // Trigger re-render if needed
    if (viewName === 'calendar') this.renderCalendar();
    if (viewName === 'teams') this.renderTeamsView();
    if (viewName === 'notes') this.renderNotesView();
  }

  /**
   * Setup Dark/Light Theme Toggle Button
   */
  setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    const icon = document.getElementById('themeIcon');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const currentTheme = this.settingsManager.settings.theme;
      const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
      this.settingsManager.updateSettings({ theme: newTheme });

      if (icon) {
        icon.className = (newTheme === 'dark') ? 'bi bi-moon-stars' : 'bi bi-sun';
      }
    });
  }

  /**
   * Live Countdown Timer Function
   * Updates every 1000ms
   */
  startCountdownTimer() {
    const updateTimer = () => {
      const now = new Date();
      const status = this.shiftCalc.getShiftStatusAt(now);

      // Hero Elements
      const heroShiftLabel = document.getElementById('heroShiftLabel');
      const heroActiveTeamText = document.getElementById('heroActiveTeamText');
      const heroNextShiftText = document.getElementById('heroNextShiftText');

      if (heroShiftLabel) {
        heroShiftLabel.textContent = `شیفت فعلی: ${status.shiftType}`;
        heroShiftLabel.className = status.isDayShift ?
          'badge bg-light text-primary fw-bold px-3 py-1 rounded-pill' :
          'badge bg-purple text-white fw-bold px-3 py-1 rounded-pill';
        if (!status.isDayShift) heroShiftLabel.style.backgroundColor = '#8b5cf6';
      }

      if (heroActiveTeamText) {
        heroActiveTeamText.textContent = `تیم فعال: تیم ${status.activeTeam}`;
      }

      if (heroNextShiftText) {
        heroNextShiftText.textContent = `شیفت بعدی: ${status.nextShiftType} (تیم ${status.nextTeam})`;
      }

      // Calculate Hours, Minutes, Seconds remaining
      const totalSec = Math.floor(status.remainingMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const cdHours = document.getElementById('cd-hours');
      const cdMinutes = document.getElementById('cd-minutes');
      const cdSeconds = document.getElementById('cd-seconds');

      if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
      if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
      if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /**
   * Render Dashboard Cards
   */
  renderDashboard() {
    const now = new Date();
    const jalali = this.calendar.g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const hijri = this.calendar.getHijriDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const weekNum = this.calendar.getJalaliWeekNumber(jalali.jy, jalali.jm, jalali.jd);
    const weekdayName = this.calendar.persianWeekdays[this.calendar.getJalaliWeekday(jalali.jy, jalali.jm, jalali.jd)];

    // Dates
    const elJalali = document.getElementById('dashJalaliDate');
    const elHijri = document.getElementById('dashHijriDate');
    const elGregorian = document.getElementById('dashGregorianDate');
    const elWeekNum = document.getElementById('dashWeekNum');

    if (elJalali) elJalali.textContent = `${weekdayName} ${jalali.jd} ${this.calendar.persianMonths[jalali.jm - 1]} ${jalali.jy}`;
    if (elHijri) elHijri.textContent = `${hijri.hd} ${this.calendar.hijriMonths[hijri.hm - 1]} ${hijri.hy}`;
    if (elGregorian) elGregorian.textContent = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    if (elWeekNum) elWeekNum.textContent = `هفته ${weekNum}`;

    // Shifts Today
    const teams = this.shiftCalc.getTeamsForJalaliDate(jalali.jy, jalali.jm, jalali.jd);
    const dayBadge = document.getElementById('dashDayTeamBadge');
    const nightBadge = document.getElementById('dashNightTeamBadge');

    if (dayBadge) dayBadge.textContent = teams.dayTeam;
    if (nightBadge) nightBadge.textContent = teams.nightTeam;

    // Events Today
    const eventContainer = document.getElementById('dashEventsContainer');
    const eventInfo = this.calendar.getEventsAndHolidayStatus(jalali.jy, jalali.jm, jalali.jd);
    if (eventContainer) {
      if (eventInfo.events.length > 0) {
        eventContainer.innerHTML = eventInfo.events.map((ev) => `<div class="badge bg-danger-subtle text-danger border border-danger mb-1 p-2 w-100 text-start">${ev}</div>`).join('');
      } else {
        eventContainer.innerHTML = '<span class="text-secondary">امروز مناسبت خاصی ثبت نشده است.</span>';
      }
    }

    // Notes Today
    const notesContainer = document.getElementById('dashNotesContainer');
    const todayStr = this.calendar.formatJalali(jalali.jy, jalali.jm, jalali.jd);
    const todayNotes = this.notesManager.getNotesForDate(todayStr);

    if (notesContainer) {
      if (todayNotes.length > 0) {
        notesContainer.innerHTML = todayNotes.map((n) => `
          <div class="p-2 border rounded-3 bg-body mb-1 d-flex justify-content-between align-items-center">
            <div>
              <strong class="d-block" style="color:${n.color}">${n.title}</strong>
              <small class="text-secondary">${n.text}</small>
            </div>
            <span class="badge bg-secondary-subtle text-secondary fs-8">${n.category}</span>
          </div>
        `).join('');
      } else {
        notesContainer.innerHTML = '<span class="text-secondary">هیچ یادداشتی برای امروز ثبت نشده است.</span>';
      }
    }
  }

  /**
   * Setup Calendar Navigation Controls
   */
  setupCalendarControls() {
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const nextBtn = document.getElementById('calNextMonthBtn');
    const todayBtn = document.getElementById('calTodayBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.viewMonth--;
        if (this.viewMonth < 1) {
          this.viewMonth = 12;
          this.viewYear--;
        }
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.viewMonth++;
        if (this.viewMonth > 12) {
          this.viewMonth = 1;
          this.viewYear++;
        }
        this.renderCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const nowG = new Date();
        const nowJ = this.calendar.g2j(nowG.getFullYear(), nowG.getMonth() + 1, nowG.getDate());
        this.viewYear = nowJ.jy;
        this.viewMonth = nowJ.jm;
        this.renderCalendar();
      });
    }
  }

  /**
   * Render Calendar Grid
   */
  renderCalendar() {
    const titleEl = document.getElementById('calMonthTitle');
    const subTitleEl = document.getElementById('calSubTitle');
    const gridContainer = document.getElementById('calendarGridContainer');

    if (!gridContainer) return;

    const monthName = this.calendar.persianMonths[this.viewMonth - 1];
    if (titleEl) titleEl.textContent = `${monthName} ${this.viewYear}`;

    const firstDayG = this.calendar.j2g(this.viewYear, this.viewMonth, 1);
    const lastDayG = this.calendar.j2g(this.viewYear, this.viewMonth, this.calendar.getDaysInJalaliMonth(this.viewYear, this.viewMonth));
    if (subTitleEl) subTitleEl.textContent = `${firstDayG.gm}/${firstDayG.gd} تا ${lastDayG.gm}/${lastDayG.gd}`;

    // Render Header Weekdays
    let html = '';
    this.calendar.persianWeekdays.forEach((wd, idx) => {
      const isFri = (idx === 6);
      html += `<div class="calendar-header-day ${isFri ? 'friday' : ''}">${wd}</div>`;
    });

    // Calculate First Weekday Index (0 = Saturday, ..., 6 = Friday)
    const firstWeekdayIdx = this.calendar.getJalaliWeekday(this.viewYear, this.viewMonth, 1);

    // Empty lead cells
    for (let i = 0; i < firstWeekdayIdx; i++) {
      html += `<div class="calendar-day-cell opacity-25 bg-transparent border-0"></div>`;
    }

    // Days in Month
    const schedule = this.shiftCalc.getMonthlySchedule(this.viewYear, this.viewMonth);
    schedule.forEach((day) => {
      const isTodayClass = day.isToday ? 'today' : '';
      const isFridayClass = day.isFriday ? 'friday' : '';

      const jalaliStr = this.calendar.formatJalali(this.viewYear, this.viewMonth, day.day);
      const notes = this.notesManager.getNotesForDate(jalaliStr);

      const hasNoteDot = notes.length > 0 ? '<div class="event-dot"></div>' : '';
      const hasEvent = day.events.length > 0 ? '<span class="badge bg-danger p-1 rounded-circle" style="width:6px;height:6px;display:inline-block;"></span>' : '';

      html += `
        <div class="calendar-day-cell ${isTodayClass} ${isFridayClass}" onclick="app.openDayDetailModal(${this.viewYear}, ${this.viewMonth}, ${day.day})">
          ${hasNoteDot}
          <div class="d-flex justify-content-between align-items-center">
            <span class="day-number">${day.day}</span>
            ${hasEvent}
          </div>
          <div class="shift-pills mt-1">
            <span class="pill-day" title="شیفت روز (روزکاری)">${day.dayTeam}</span>
            <span class="pill-night" title="شیفت شب (شبکاری)">${day.nightTeam}</span>
          </div>
        </div>
      `;
    });

    gridContainer.innerHTML = html;
  }

  /**
   * Open Day Detail Modal for a specific date
   */
  openDayDetailModal(jy, jm, jd) {
    const titleEl = document.getElementById('modalDayTitle');
    const bodyEl = document.getElementById('modalDayBody');
    const addNoteBtn = document.getElementById('modalAddNoteBtn');

    const jalaliStr = this.calendar.formatJalali(jy, jm, jd);
    this.selectedDateForNote = jalaliStr;

    const g = this.calendar.j2g(jy, jm, jd);
    const h = this.calendar.getHijriDate(g.gy, g.gm, g.gd);
    const weekdayIdx = this.calendar.getJalaliWeekday(jy, jm, jd);
    const weekdayName = this.calendar.persianWeekdays[weekdayIdx];
    const teams = this.shiftCalc.getTeamsForJalaliDate(jy, jm, jd);
    const eventInfo = this.calendar.getEventsAndHolidayStatus(jy, jm, jd);
    const notes = this.notesManager.getNotesForDate(jalaliStr);

    if (titleEl) titleEl.textContent = `${weekdayName} ${jd} ${this.calendar.persianMonths[jm - 1]} ${jy}`;

    let eventsHtml = eventInfo.events.length > 0 ?
      eventInfo.events.map((e) => `<div class="badge bg-danger-subtle text-danger border border-danger mb-1 p-2 w-100 text-start">${e}</div>`).join('') :
      '<span class="text-secondary fs-7">مناسبت خاصی وجود ندارد.</span>';

    let notesHtml = notes.length > 0 ?
      notes.map((n) => `
        <div class="p-2 border rounded-3 bg-body mb-2 d-flex justify-content-between align-items-center">
          <div>
            <strong class="d-block" style="color:${n.color}">${n.title}</strong>
            <small class="text-secondary">${n.text}</small>
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="app.deleteNote('${n.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `).join('') :
      '<span class="text-secondary fs-7">هیچ یادداشتی برای این روز ثبت نشده است.</span>';

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="row g-2 mb-3 fs-7">
          <div class="col-6"><strong>تاریخ میلادی:</strong> ${g.gy}/${g.gm}/${g.gd}</div>
          <div class="col-6"><strong>تاریخ قمری:</strong> ${h.hy}/${h.hm}/${h.hd}</div>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <div class="p-2 border rounded-3 text-center bg-body-tertiary">
              <small class="text-secondary d-block">شیفت روز (روزکاری)</small>
              <span class="badge bg-primary fs-6">تیم ${teams.dayTeam}</span>
            </div>
          </div>
          <div class="col-6">
            <div class="p-2 border rounded-3 text-center bg-body-tertiary">
              <small class="text-secondary d-block">شیفت شب (شبکاری)</small>
              <span class="badge bg-purple fs-6" style="background:#8b5cf6;">تیم ${teams.nightTeam}</span>
            </div>
          </div>
        </div>
        <h6 class="fw-bold text-danger fs-7 mb-2"><i class="bi bi-star me-1"></i>مناسبت‌ها:</h6>
        <div class="mb-3">${eventsHtml}</div>
        <h6 class="fw-bold text-success fs-7 mb-2"><i class="bi bi-journal-text me-1"></i>یادداشت‌های این روز:</h6>
        <div>${notesHtml}</div>
      `;
    }

    if (addNoteBtn) {
      addNoteBtn.onclick = () => {
        if (this.dayDetailModal) this.dayDetailModal.hide();
        this.openAddNoteModal(jalaliStr);
      };
    }

    if (this.dayDetailModal) this.dayDetailModal.show();
  }

  /**
   * Setup Team Tabs
   */
  setupTeamTabs() {
    const tabs = document.querySelectorAll('#teamTabs .nav-link');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        this.selectedTeam = parseInt(tab.getAttribute('data-team'), 10);
        this.renderTeamsView();
      });
    });
  }

  /**
   * Render Team Page Stats & Upcoming Shifts
   */
  renderTeamsView() {
    const stats = this.shiftCalc.getTeamYearlyStats(this.selectedTeam, this.viewYear);
    const upcoming = this.shiftCalc.getUpcomingShiftsForTeam(this.selectedTeam, new Date(), 10);

    const elHours = document.getElementById('teamStatHours');
    const elDayCount = document.getElementById('teamStatDayCount');
    const elNightCount = document.getElementById('teamStatNightCount');

    if (elHours) elHours.textContent = stats.totalWorkingHours;
    if (elDayCount) elDayCount.textContent = stats.totalDayShifts;
    if (elNightCount) elNightCount.textContent = stats.totalNightShifts;

    // Upcoming List
    const upcomingList = document.getElementById('teamUpcomingShiftsList');
    if (upcomingList) {
      upcomingList.innerHTML = upcoming.map((s) => `
        <div class="list-group-item bg-body-tertiary border-start border-4 ${s.isDayShift ? 'border-primary' : 'border-purple'}" style="${!s.isDayShift ? 'border-left-color:#8b5cf6!important;' : ''}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${s.weekdayName} - ${s.jalaliDate}</strong>
              <small class="text-secondary d-block">ساعت: ${s.startHourStr} تا ${s.endHourStr}</small>
            </div>
            <span class="${s.isDayShift ? 'badge-shift-day' : 'badge-shift-night'}">${s.shiftType}</span>
          </div>
        </div>
      `).join('');
    }

    // Monthly Table
    const tableBody = document.getElementById('teamMonthlyStatsTable');
    if (tableBody) {
      tableBody.innerHTML = stats.monthlyBreakdown.map((m) => `
        <tr>
          <td>${m.monthName}</td>
          <td>${m.dayShifts}</td>
          <td>${m.nightShifts}</td>
          <td class="fw-bold">${m.hours} ساعت</td>
        </tr>
      `).join('');
    }
  }

  /**
   * Setup Date Converter Inputs
   */
  setupConverterInputs() {
    const yInput = document.getElementById('convJalaliYear');
    const mInput = document.getElementById('convJalaliMonth');
    const dInput = document.getElementById('convJalaliDay');

    const updateConv = () => {
      const jy = parseInt(yInput.value, 10) || 1405;
      const jm = parseInt(mInput.value, 10) || 1;
      const jd = parseInt(dInput.value, 10) || 1;

      const res = this.converter.convertFromJalali(jy, jm, jd);

      document.getElementById('resJalali').textContent = res.jalaliFull;
      document.getElementById('resGregorian').textContent = res.gregorianFull;
      document.getElementById('resHijri').textContent = res.hijriFull;
      document.getElementById('resWeekday').textContent = res.weekdayName;
      document.getElementById('resWeekNum').textContent = `هفته ${res.weekNum}`;

      document.getElementById('resDayTeam').textContent = `تیم ${res.dayTeam}`;
      document.getElementById('resNightTeam').textContent = `تیم ${res.nightTeam}`;

      const eventsEl = document.getElementById('resEvents');
      if (eventsEl) {
        eventsEl.textContent = res.events.length > 0 ? `مناسبت‌ها: ${res.events.join(' - ')}` : 'مناسبت‌ها: -';
      }
    };

    if (yInput) yInput.addEventListener('input', updateConv);
    if (mInput) mInput.addEventListener('change', updateConv);
    if (dInput) dInput.addEventListener('input', updateConv);

    updateConv();
  }

  /**
   * Render Converter Initial View
   */
  renderConverterView() {
    const yInput = document.getElementById('convJalaliYear');
    if (yInput) yInput.dispatchEvent(new Event('input'));
  }

  /**
   * Setup Search Engine
   */
  setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    const performSearch = () => {
      const q = searchInput ? searchInput.value.trim() : '';
      const container = document.getElementById('searchResultsContainer');
      if (!container) return;

      if (!q) {
        container.innerHTML = '<div class="text-center text-secondary py-4">عبارت مورد نظر خود را وارد کنید.</div>';
        return;
      }

      // Search Notes
      const notes = this.notesManager.searchNotes(q);

      // Search Events
      const matchedEvents = [];
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 31; d++) {
          const ev = this.calendar.getEventsAndHolidayStatus(this.viewYear, m, d);
          ev.events.forEach((eventName) => {
            if (eventName.includes(q)) {
              matchedEvents.push({
                date: this.calendar.formatJalali(this.viewYear, m, d),
                event: eventName
              });
            }
          });
        }
      }

      let resultsHtml = '';

      if (notes.length > 0) {
        resultsHtml += '<h6 class="fw-bold text-success mt-2 mb-2">یادداشت‌های پیدا شده:</h6>';
        notes.forEach((n) => {
          resultsHtml += `
            <div class="list-group-item bg-body-tertiary mb-2 rounded-3">
              <strong style="color:${n.color}">${n.title}</strong> (${n.jalaliDate})
              <p class="m-0 fs-7 text-secondary">${n.text}</p>
            </div>
          `;
        });
      }

      if (matchedEvents.length > 0) {
        resultsHtml += '<h6 class="fw-bold text-danger mt-3 mb-2">مناسبت‌های پیدا شده:</h6>';
        matchedEvents.forEach((ev) => {
          resultsHtml += `
            <div class="list-group-item bg-body-tertiary mb-2 rounded-3">
              <span class="badge bg-danger me-2">${ev.date}</span>
              <span>${ev.event}</span>
            </div>
          `;
        });
      }

      if (notes.length === 0 && matchedEvents.length === 0) {
        resultsHtml = '<div class="text-center text-secondary py-4">هیچ نتیجه‌ای یافت نشد.</div>';
      }

      container.innerHTML = resultsHtml;
    };

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }
  }

  /**
   * Setup Notes Manager Functions
   */
  setupNotes() {
    const form = document.getElementById('noteForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('noteIdInput').value;
        const title = document.getElementById('noteTitleInput').value;
        const jalaliDate = document.getElementById('noteDateInput').value;
        const text = document.getElementById('noteTextInput').value;
        const category = document.getElementById('noteCategoryInput').value;
        const color = document.getElementById('noteColorInput').value;

        if (id) {
          this.notesManager.updateNote(id, { title, jalaliDate, text, category, color });
        } else {
          this.notesManager.addNote({ title, jalaliDate, text, category, color });
        }

        if (this.noteModal) this.noteModal.hide();
        this.renderNotesView();
        this.renderDashboard();
      });
    }

    const searchNotesInput = document.getElementById('notesSearchInput');
    if (searchNotesInput) {
      searchNotesInput.addEventListener('input', () => {
        this.renderNotesView(searchNotesInput.value);
      });
    }
  }

  /**
   * Render Notes List
   * @param {string} filterQuery
   */
  renderNotesView(filterQuery = '') {
    const container = document.getElementById('notesListContainer');
    if (!container) return;

    const notes = filterQuery ? this.notesManager.searchNotes(filterQuery) : this.notesManager.getAllNotes();

    if (notes.length === 0) {
      container.innerHTML = '<div class="text-center text-secondary py-4">هیچ یادداشتی موجود نیست.</div>';
      return;
    }

    container.innerHTML = notes.map((n) => `
      <div class="app-card mb-2 p-3 border-start border-4" style="border-left-color:${n.color}!important;">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="fs-6" style="color:${n.color}">${n.title}</strong>
          <span class="badge bg-secondary-subtle text-secondary fs-8">${n.jalaliDate}</span>
        </div>
        <p class="m-0 fs-7 text-secondary mb-2">${n.text}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge bg-primary-subtle text-primary fs-8">${n.category}</span>
          <div>
            <button class="btn btn-xs btn-outline-info me-1" onclick="app.openEditNoteModal('${n.id}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-xs btn-outline-danger" onclick="app.deleteNote('${n.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Open Add Note Modal
   * @param {string} dateStr
   */
  openAddNoteModal(dateStr = '') {
    document.getElementById('noteIdInput').value = '';
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteDateInput').value = dateStr || this.selectedDateForNote;
    document.getElementById('noteTextInput').value = '';

    const modalTitle = document.getElementById('noteModalTitle');
    if (modalTitle) modalTitle.textContent = 'افزودن یادداشت جدید';

    if (this.noteModal) this.noteModal.show();
  }

  /**
   * Open Edit Note Modal
   * @param {string} noteId
   */
  openEditNoteModal(noteId) {
    const note = this.notesManager.getAllNotes().find((n) => n.id === noteId);
    if (!note) return;

    document.getElementById('noteIdInput').value = note.id;
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteDateInput').value = note.jalaliDate;
    document.getElementById('noteTextInput').value = note.text;
    document.getElementById('noteCategoryInput').value = note.category;
    document.getElementById('noteColorInput').value = note.color;

    const modalTitle = document.getElementById('noteModalTitle');
    if (modalTitle) modalTitle.textContent = 'ویرایش یادداشت';

    if (this.noteModal) this.noteModal.show();
  }

  /**
   * Delete Note
   * @param {string} noteId
   */
  deleteNote(noteId) {
    if (confirm('آیا از حذف این یادداشت اطمینان دارید؟')) {
      this.notesManager.deleteNote(noteId);
      this.renderNotesView();
      this.renderDashboard();
    }
  }

  /**
   * Setup Reports & Backup Listeners
   */
  setupReportsAndBackup() {
    const printBtn = document.getElementById('printScheduleBtn');
    const shareBtn = document.getElementById('shareScheduleBtn');
    const exportBtn = document.getElementById('exportBackupBtn');
    const importBtn = document.getElementById('importBackupBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.reportEngine.printMonthlySchedule(this.viewYear, this.viewMonth);
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.reportEngine.shareMonthlySchedule(this.viewYear, this.viewMonth);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.reportEngine.exportFullBackup();
      });
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        if (this.importBackupModal) this.importBackupModal.show();
      });
    }

    if (confirmImportBtn) {
      confirmImportBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('backupFileInput');
        if (fileInput && fileInput.files.length > 0) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const success = this.reportEngine.importFullBackup(e.target.result);
            if (success) {
              alert('پشتیبان‌گیری با موفقیت بازگردانی شد.');
              location.reload();
            } else {
              alert('خطا در خواندن فایل پشتیبان.');
            }
          };
          reader.readAsText(fileInput.files[0]);
        }
      });
    }
  }

  /**
   * Setup Settings Form
   */
  setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    const resetBtn = document.getElementById('resetSettingsBtn');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const theme = document.getElementById('settingTheme').value;
        const fontSize = document.getElementById('settingFontSize').value;
        const refJalaliYear = parseInt(document.getElementById('settingRefYear').value, 10);
        const refJalaliMonth = parseInt(document.getElementById('settingRefMonth').value, 10);
        const refJalaliDay = parseInt(document.getElementById('settingRefDay').value, 10);
        const refTeam = parseInt(document.getElementById('settingRefTeam').value, 10);
        const shiftDurationHours = parseInt(document.getElementById('settingShiftDuration').value, 10);

        const rotStr = document.getElementById('settingRotationOrder').value;
        const rotationOrder = rotStr.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));

        this.settingsManager.updateSettings({
          theme,
          fontSize,
          refJalaliYear,
          refJalaliMonth,
          refJalaliDay,
          refTeam,
          shiftDurationHours,
          rotationOrder
        });

        this.shiftCalc.updateConfig(this.settingsManager.settings);

        alert('تنظیمات با موفقیت ذخیره شد.');
        this.renderDashboard();
        this.renderCalendar();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('آیا می‌خواهید تمامی تنظیمات به حالت اولیه بازگردند؟')) {
          this.settingsManager.resetToDefaults();
          this.shiftCalc.updateConfig(this.settingsManager.settings);
          alert('تنظیمات بازنشانی گردید.');
          location.reload();
        }
      });
    }
  }

  /**
   * Setup PWA Service Worker & Install Prompt
   */
  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
          .then((reg) => console.log('[PWA] Service Worker registered:', reg.scope))
          .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
      });
    }

    const installBtn = document.getElementById('pwaInstallBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installBtn) installBtn.classList.remove('d-none');
    });

    if (installBtn) {
      installBtn.addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('[PWA] User accepted install prompt');
            }
            this.deferredPrompt = null;
            installBtn.classList.add('d-none');
          });
        }
      });
    }
  }
}

// Instantiate and launch App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaghvimSinaApp();
  window.app.init();
});
