/**
 * CalendarEngine - Core Calendar calculation library for Taghvim Sina
 * Handles Persian (Jalali), Gregorian, and Hijri date conversions,
 * Iranian holidays, and event management.
 */

class CalendarEngine {
  constructor() {
    this.persianMonths = [
      "فروردین", "اردیبهشت", "خرداد",
      "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر",
      "دی", "بهمن", "اسفند"
    ];

    this.hijriMonths = [
      "محرم", "صفر", "ربیع‌الاول", "ربیع‌الثانی",
      "جمادی‌الاول", "جمادی‌الثانی", "رجب", "شعبان",
      "رمضان", "شوال", "ذی‌القعده", "ذی‌الحجه"
    ];

    this.weekdays = [
      "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"
    ];

    this.persianWeekdays = [
      "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"
    ];

    // Fixed Solar (Jalali) Official Holidays in Iran
    this.solarHolidays = {
      "1/1": "عید نوروز",
      "1/2": "عید نوروز",
      "1/3": "عید نوروز",
      "1/4": "عید نوروز",
      "1/12": "روز جمهوری اسلامی ایران",
      "1/13": "روز طبیعت (سیزده بدر)",
      "3/14": "رحلت امام خمینی (ره)",
      "3/15": "قیام ۱۵ خرداد",
      "12/29": "روز ملی شدن صنعت نفت ایران"
    };

    // Solar National / Cultural Events (Non-holiday or notable)
    this.solarEvents = {
      "1/18": "روز سلامتی (روز جهانی بهداشت)",
      "1/29": "روز ارتش جمهوری اسلامی ایران",
      "2/1": "روز بزرگداشت سعدی",
      "2/3": "روز بزرگداشت شیخ بهایی / روز معمار",
      "2/9": "روز شوراها",
      "2/12": "روز معلم (شهادت استاد مطهری)",
      "2/25": "روز پاسداشت زبان فارسی و بزرگداشت فردوسی",
      "2/28": "روز بزرگداشت حکیم عمر خیام",
      "3/3": "فتح خرمشهر (روز مقاومت و پیروزی)",
      "4/1": "روز اصناف",
      "4/14": "روز قلم",
      "4/25": "روز بهزیستی و تامین اجتماعی",
      "5/8": "روز بزرگداشت شیخ شهاب‌الدین سهروردی",
      "5/17": "روز خبرنگار",
      "5/28": "سالروز فاجعه آتش‌سوزی سینما رکس آبادان",
      "6/1": "روز پزشک (بزرگداشت ابن سینا)",
      "6/5": "روز داروساز (بزرگداشت زکریای رازی)",
      "6/27": "روز شعر و ادب فارسی (بزرگداشت شهریار)",
      "7/8": "روز بزرگداشت مولوی",
      "7/20": "روز بزرگداشت حافظ",
      "8/8": "روز نوجوان و بسیج دانش‌آموزی",
      "8/13": "روز دانش‌آموز",
      "9/16": "روز دانشجو",
      "9/30": "شب یلدا",
      "10/5": "روز ایمنی در برابر زلزله (کاهش بلایای طبیعی)",
      "11/22": "پیروزی انقلاب اسلامی ایران",
      "12/5": "روز مهندس (بزرگداشت خواجه نصیرالدین طوسی)"
    };
  }

  g2j(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return { jy, jm, jd };
  }

  j2g(jy, jm, jd) {
    let gy = (jy <= 979) ? 621 : 1600;
    jy -= (jy <= 979) ? 0 : 979;
    let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    while (gm < 13 && days >= sal_a[gm]) {
      days -= sal_a[gm];
      gm++;
    }
    let gd = days + 1;
    return { gy, gm, gd };
  }

  isJalaliLeap(jy) {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    let bl = breaks.length;
    let jp = breaks[0];
    let jump = 0;
    if (jy < jp || jy >= breaks[bl - 1]) return false;
    for (let i = 1; i < bl; i++) {
      let jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      jp = jm;
    }
    let N = jy - jp;
    if (jump - N < 6) N = N - jump + Math.floor((jump + 4) / 33) * 33;
    let leap = ((((N + 1) % 33) - 1) % 4);
    if (leap === -1) leap = 4;
    return leap === 0;
  }

  getDaysInJalaliMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return this.isJalaliLeap(jy) ? 30 : 29;
  }

  getHijriDate(gy, gm, gd) {
    let day = gd;
    let month = gm;
    let year = gy;

    if (month < 3) {
      year -= 1;
      month += 12;
    }

    let a = Math.floor(year / 100);
    let b = 2 - a + Math.floor(a / 4);
    if (year < 1583) b = 0;
    if (year === 1582) {
      if (month > 10) b = -10;
      if (month === 10) {
        b = -10;
        if (day > 14) b = 2 - a + Math.floor(a / 4);
      }
    }

    let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    let z = jd - 1948439.5;
    let hy = Math.floor((z - 1) / 354.367068);
    let remainder = z - (Math.floor(hy * 354.367068) + 1);
    let hm = Math.min(12, Math.max(1, Math.ceil(remainder / 29.5)));
    let hd = Math.max(1, Math.round(remainder - (hm - 1) * 29.5));
    if (hd > 30) {
      hd = 1;
      hm += 1;
    }
    if (hm > 12) {
      hm = 1;
      hy += 1;
    }
    return { hy: hy + 1, hm, hd };
  }

  getJalaliWeekday(jy, jm, jd) {
    const g = this.j2g(jy, jm, jd);
    const date = new Date(g.gy, g.gm - 1, g.gd);
    let day = date.getDay();
    return (day + 1) % 7;
  }

  getJalaliWeekNumber(jy, jm, jd) {
    let dayOfYear = 0;
    for (let m = 1; m < jm; m++) {
      dayOfYear += this.getDaysInJalaliMonth(jy, m);
    }
    dayOfYear += jd;

    let firstDayWeekday = this.getJalaliWeekday(jy, 1, 1);
    return Math.ceil((dayOfYear + firstDayWeekday) / 7);
  }

  getEventsAndHolidayStatus(jy, jm, jd) {
    const key = `${jm}/${jd}`;
    const events = [];
    let isHoliday = false;

    if (this.solarHolidays[key]) {
      events.push(this.solarHolidays[key]);
      isHoliday = true;
    }

    if (this.solarEvents[key]) {
      events.push(this.solarEvents[key]);
    }

    const weekday = this.getJalaliWeekday(jy, jm, jd);
    const isFriday = (weekday === 6);
    if (isFriday) {
      isHoliday = true;
    }

    return { events, isHoliday, isFriday };
  }

  formatJalali(jy, jm, jd) {
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    return `${jy}/${pad(jm)}/${pad(jd)}`;
  }
}

window.CalendarEngine = CalendarEngine;
