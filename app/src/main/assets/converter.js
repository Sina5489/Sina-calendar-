/**
 * DateConverterUI - Handles Date Conversions for Taghvim Sina
 * Converts between Persian (Jalali), Gregorian, and Hijri dates with full shift info.
 */

class DateConverterUI {
  constructor(calendar, shiftCalc) {
    this.calendar = calendar;
    this.shiftCalc = shiftCalc;
  }

  /**
   * Convert from Jalali Date
   * @param {number} jy
   * @param {number} jm
   * @param {number} jd
   * @returns {Object} Full result details
   */
  convertFromJalali(jy, jm, jd) {
    const g = this.calendar.j2g(jy, jm, jd);
    const h = this.calendar.getHijriDate(g.gy, g.gm, g.gd);
    const weekdayIdx = this.calendar.getJalaliWeekday(jy, jm, jd);
    const weekdayName = this.calendar.persianWeekdays[weekdayIdx];
    const weekNum = this.calendar.getJalaliWeekNumber(jy, jm, jd);
    const events = this.calendar.getEventsAndHolidayStatus(jy, jm, jd);
    const teams = this.shiftCalc.getTeamsForJalaliDate(jy, jm, jd);

    return {
      jalaliStr: `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`,
      jalaliFull: `${weekdayName} ${jd} ${this.calendar.persianMonths[jm - 1]} ${jy}`,
      gregorianStr: `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`,
      gregorianFull: `${g.gd} / ${g.gm} / ${g.gy}`,
      hijriStr: `${h.hy}/${String(h.hm).padStart(2, '0')}/${String(h.hd).padStart(2, '0')}`,
      hijriFull: `${h.hd} ${this.calendar.hijriMonths[h.hm - 1]} ${h.hy}`,
      weekdayName,
      weekNum,
      dayTeam: teams.dayTeam,
      nightTeam: teams.nightTeam,
      events: events.events,
      isHoliday: events.isHoliday,
      isFriday: events.isFriday
    };
  }

  /**
   * Convert from Gregorian Date
   * @param {number} gy
   * @param {number} gm
   * @param {number} gd
   * @returns {Object} Full result details
   */
  convertFromGregorian(gy, gm, gd) {
    const j = this.calendar.g2j(gy, gm, gd);
    return this.convertFromJalali(j.jy, j.jm, j.jd);
  }

  /**
   * Convert from Hijri Date (Approximate)
   * @param {number} hy
   * @param {number} hm
   * @param {number} hd
   * @returns {Object} Full result details
   */
  convertFromHijri(hy, hm, hd) {
    // Convert Tabular Hijri to Gregorian approximate Julian day
    const jd = Math.floor((hy - 1) * 354.367068) + Math.floor((hm - 1) * 29.5) + hd + 1948439.5;
    let l = jd + 68569;
    let n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    let i = Math.floor((4000 * (l + 1)) / 1464101);
    l = l - Math.floor((1461 * i) / 4) + 31;
    let j = Math.floor((80 * l) / 2447);
    let gd = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    let gm = j + 2 - (12 * l);
    let gy = 100 * (n - 49) + i + l;

    return this.convertFromGregorian(gy, gm, gd);
  }
}

window.DateConverterUI = DateConverterUI;
