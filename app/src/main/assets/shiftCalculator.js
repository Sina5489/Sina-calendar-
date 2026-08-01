/**
 * ShiftCalculator - Core Shift Engine for Taghvim Sina
 * Calculates 5-Team 12-Hour Shift Rotations (1 -> 3 -> 5 -> 2 -> 4)
 * Reference Date: 29 Tir 1405 07:00 AM (Day Shift = Team 2)
 * Shift Labels: "روزکاری" (Day Shift) and "شبکاری" (Night Shift)
 */

class ShiftCalculator {
  constructor(config = {}) {
    this.calendar = new CalendarEngine();

    // Default Configuration
    this.rotationOrder = config.rotationOrder || [1, 3, 5, 2, 4];
    this.teamCount = config.teamCount || 5;
    this.shiftDurationHours = config.shiftDurationHours || 12;

    // Reference Date Defaults: 29 Tir 1405 07:00 AM
    // 29 Tir 1405 = 2026-07-20 in Gregorian
    this.refJalaliYear = config.refJalaliYear || 1405;
    this.refJalaliMonth = config.refJalaliMonth || 4; // Tir
    this.refJalaliDay = config.refJalaliDay || 29;
    this.refHour = config.refHour !== undefined ? config.refHour : 7;
    this.refMinute = config.refMinute !== undefined ? config.refMinute : 0;

    // At Reference Date 07:00 AM, Day Shift is Team 2.
    // Team 2 is at index 3 in rotationOrder [1, 3, 5, 2, 4].
    this.refTeam = config.refTeam || 2;

    // Shift Start Times
    this.dayShiftStartHour = config.dayShiftStartHour || 7; // 07:00
    this.nightShiftStartHour = config.nightShiftStartHour || 19; // 19:00

    // Initialize Reference Timestamp
    this._initReferenceTimestamp();
  }

  /**
   * Initializes the reference Date object from Jalali / Gregorian reference settings.
   */
  _initReferenceTimestamp() {
    const g = this.calendar.j2g(this.refJalaliYear, this.refJalaliMonth, this.refJalaliDay);
    this.refDate = new Date(g.gy, g.gm - 1, g.gd, this.refHour, this.refMinute, 0, 0);

    // Find starting rotation index for refTeam
    const idx = this.rotationOrder.indexOf(this.refTeam);
    this.refRotationIndex = (idx !== -1) ? idx : 0;
  }

  /**
   * Update Shift Engine Settings dynamically
   * @param {Object} newConfig
   */
  updateConfig(newConfig) {
    if (newConfig.rotationOrder) this.rotationOrder = newConfig.rotationOrder;
    if (newConfig.teamCount) this.teamCount = newConfig.teamCount;
    if (newConfig.shiftDurationHours) this.shiftDurationHours = newConfig.shiftDurationHours;
    if (newConfig.refJalaliYear) this.refJalaliYear = newConfig.refJalaliYear;
    if (newConfig.refJalaliMonth) this.refJalaliMonth = newConfig.refJalaliMonth;
    if (newConfig.refJalaliDay) this.refJalaliDay = newConfig.refJalaliDay;
    if (newConfig.refHour !== undefined) this.refHour = newConfig.refHour;
    if (newConfig.refTeam) this.refTeam = newConfig.refTeam;
    if (newConfig.dayShiftStartHour !== undefined) this.dayShiftStartHour = newConfig.dayShiftStartHour;
    if (newConfig.nightShiftStartHour !== undefined) this.nightShiftStartHour = newConfig.nightShiftStartHour;

    this._initReferenceTimestamp();
  }

  /**
   * Calculate Shift Slot Index from Reference Time
   * Each slot is 12 hours (or configured shiftDurationHours)
   * Slot 0 = Reference Time (29 Tir 1405 07:00 AM)
   * @param {Date} targetDate
   * @returns {number} Slot Index
   */
  getSlotIndex(targetDate) {
    const msPerShift = this.shiftDurationHours * 60 * 60 * 1000;
    const diffMs = targetDate.getTime() - this.refDate.getTime();
    return Math.floor(diffMs / msPerShift);
  }

  /**
   * Get Active Team for a specific Date & Time timestamp
   * @param {Date} targetDate
   * @returns {{
   *   activeTeam: number,
   *   shiftType: string,
   *   isDayShift: boolean,
   *   slotIndex: number,
   *   shiftStart: Date,
   *   shiftEnd: Date,
   *   remainingMs: number
   * }}
   */
  getShiftStatusAt(targetDate = new Date()) {
    const slotIndex = this.getSlotIndex(targetDate);
    const rotLen = this.rotationOrder.length;

    // Rotational team index
    let rotIndex = (this.refRotationIndex + slotIndex) % rotLen;
    if (rotIndex < 0) rotIndex += rotLen;

    const activeTeam = this.rotationOrder[rotIndex];

    // Determine if this slot is Day Shift (روزکاری) or Night Shift (شبکاری)
    // Slot 0 starts at 07:00 (Day Shift)
    const isDayShift = (Math.abs(slotIndex % 2) === 0 && slotIndex >= 0) || (Math.abs(slotIndex % 2) === 1 && slotIndex < 0);
    const shiftType = isDayShift ? "روزکاری" : "شبکاری";

    // Shift Start and End Dates
    const msPerShift = this.shiftDurationHours * 60 * 60 * 1000;
    const shiftStart = new Date(this.refDate.getTime() + slotIndex * msPerShift);
    const shiftEnd = new Date(shiftStart.getTime() + msPerShift);
    const remainingMs = Math.max(0, shiftEnd.getTime() - targetDate.getTime());

    // Next Shift info
    let nextRotIndex = (rotIndex + 1) % rotLen;
    const nextTeam = this.rotationOrder[nextRotIndex];
    const nextShiftType = isDayShift ? "شبکاری" : "روزکاری";

    return {
      activeTeam,
      shiftType,
      isDayShift,
      slotIndex,
      shiftStart,
      shiftEnd,
      remainingMs,
      nextTeam,
      nextShiftType,
      nextShiftStart: shiftEnd
    };
  }

  /**
   * Get Day Shift Team and Night Shift Team for a specific Jalali Date (jy, jm, jd)
   * @param {number} jy Jalali Year
   * @param {number} jm Jalali Month
   * @param {number} jd Jalali Day
   * @returns {{dayTeam: number, nightTeam: number}}
   */
  getTeamsForJalaliDate(jy, jm, jd) {
    const g = this.calendar.j2g(jy, jm, jd);
    // Day Shift starts at 07:01 AM on that day
    const dayDate = new Date(g.gy, g.gm - 1, g.gd, this.dayShiftStartHour, 1, 0);
    const dayStatus = this.getShiftStatusAt(dayDate);

    // Night Shift starts at 19:01 PM on that day
    const nightDate = new Date(g.gy, g.gm - 1, g.gd, this.nightShiftStartHour, 1, 0);
    const nightStatus = this.getShiftStatusAt(nightDate);

    return {
      dayTeam: dayStatus.activeTeam,
      nightTeam: nightStatus.activeTeam
    };
  }

  /**
   * Get Monthly Shift Matrix for a Jalali Month
   * @param {number} jy Jalali Year
   * @param {number} jm Jalali Month
   * @returns {Array<Object>} Array of day details
   */
  getMonthlySchedule(jy, jm) {
    const daysInMonth = this.calendar.getDaysInJalaliMonth(jy, jm);
    const todayJalali = this.calendar.g2j(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

    const schedule = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const g = this.calendar.j2g(jy, jm, d);
      const weekdayIdx = this.calendar.getJalaliWeekday(jy, jm, d);
      const weekdayName = this.calendar.persianWeekdays[weekdayIdx];
      const weekNum = this.calendar.getJalaliWeekNumber(jy, jm, d);
      const eventInfo = this.calendar.getEventsAndHolidayStatus(jy, jm, d);
      const teams = this.getTeamsForJalaliDate(jy, jm, d);
      const isToday = (todayJalali.jy === jy && todayJalali.jm === jm && todayJalali.jd === d);

      schedule.push({
        day: d,
        jy,
        jm,
        jd: d,
        gy: g.gy,
        gm: g.gm,
        gd: g.gd,
        weekdayIdx,
        weekdayName,
        weekNum,
        dayTeam: teams.dayTeam,
        nightTeam: teams.nightTeam,
        events: eventInfo.events,
        isHoliday: eventInfo.isHoliday,
        isFriday: eventInfo.isFriday,
        isToday
      });
    }

    return schedule;
  }

  /**
   * Generates Statistics for a specific Team across a Jalali Year
   * @param {number} teamId Team Number (1-5)
   * @param {number} jy Jalali Year
   * @returns {{
   *   teamId: number,
   *   totalDayShifts: number,
   *   totalNightShifts: number,
   *   totalWorkingHours: number,
   *   monthlyBreakdown: Array<{month: number, dayShifts: number, nightShifts: number, hours: number}>
   * }}
   */
  getTeamYearlyStats(teamId, jy) {
    let totalDayShifts = 0;
    let totalNightShifts = 0;
    const monthlyBreakdown = [];

    for (let m = 1; m <= 12; m++) {
      const daysInMonth = this.calendar.getDaysInJalaliMonth(jy, m);
      let mDayShifts = 0;
      let mNightShifts = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const teams = this.getTeamsForJalaliDate(jy, m, d);
        if (teams.dayTeam === teamId) {
          mDayShifts++;
          totalDayShifts++;
        }
        if (teams.nightTeam === teamId) {
          mNightShifts++;
          totalNightShifts++;
        }
      }

      const mHours = (mDayShifts + mNightShifts) * this.shiftDurationHours;
      monthlyBreakdown.push({
        month: m,
        monthName: this.calendar.persianMonths[m - 1],
        dayShifts: mDayShifts,
        nightShifts: mNightShifts,
        hours: mHours
      });
    }

    const totalWorkingHours = (totalDayShifts + totalNightShifts) * this.shiftDurationHours;

    return {
      teamId,
      totalDayShifts,
      totalNightShifts,
      totalWorkingHours,
      monthlyBreakdown
    };
  }

  /**
   * Get Upcoming N Shifts for a specific Team starting from target Date
   * @param {number} teamId
   * @param {Date} startDate
   * @param {number} count Number of upcoming shifts to fetch
   * @returns {Array<Object>}
   */
  getUpcomingShiftsForTeam(teamId, startDate = new Date(), count = 10) {
    const shifts = [];
    const msPerShift = this.shiftDurationHours * 60 * 60 * 1000;
    let currSlot = this.getSlotIndex(startDate);

    // Look ahead up to 500 shift slots
    for (let i = 0; i < 500 && shifts.length < count; i++) {
      const slot = currSlot + i;
      const rotLen = this.rotationOrder.length;
      let rotIndex = (this.refRotationIndex + slot) % rotLen;
      if (rotIndex < 0) rotIndex += rotLen;

      if (this.rotationOrder[rotIndex] === teamId) {
        const shiftStart = new Date(this.refDate.getTime() + slot * msPerShift);
        const shiftEnd = new Date(shiftStart.getTime() + msPerShift);
        const isDayShift = (Math.abs(slot % 2) === 0 && slot >= 0) || (Math.abs(slot % 2) === 1 && slot < 0);
        const shiftType = isDayShift ? "روزکاری" : "شبکاری";

        const jalaliStart = this.calendar.g2j(shiftStart.getFullYear(), shiftStart.getMonth() + 1, shiftStart.getDate());
        const weekdayIdx = this.calendar.getJalaliWeekday(jalaliStart.jy, jalaliStart.jm, jalaliStart.jd);

        shifts.push({
          shiftStart,
          shiftEnd,
          shiftType,
          isDayShift,
          jalaliDate: this.calendar.formatJalali(jalaliStart.jy, jalaliStart.jm, jalaliStart.jd),
          weekdayName: this.calendar.persianWeekdays[weekdayIdx],
          startHourStr: `${String(shiftStart.getHours()).padStart(2, '0')}:${String(shiftStart.getMinutes()).padStart(2, '0')}`,
          endHourStr: `${String(shiftEnd.getHours()).padStart(2, '0')}:${String(shiftEnd.getMinutes()).padStart(2, '0')}`
        });
      }
    }

    return shifts;
  }
}

window.ShiftCalculator = ShiftCalculator;
