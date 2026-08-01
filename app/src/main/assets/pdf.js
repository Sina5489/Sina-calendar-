/**
 * ReportEngine - Print & Export Helper for Taghvim Sina
 * Renders print-friendly monthly shift schedules and JSON backups.
 */

class ReportEngine {
  constructor(calendar, shiftCalc, notesManager, settingsManager) {
    this.calendar = calendar;
    this.shiftCalc = shiftCalc;
    this.notesManager = notesManager;
    this.settingsManager = settingsManager;
  }

  /**
   * Generates printable HTML string for a Jalali Month Shift Schedule
   * @param {number} jy Jalali Year
   * @param {number} jm Jalali Month
   * @returns {string} Printable HTML
   */
  generatePrintableHtml(jy, jm) {
    const monthName = this.calendar.persianMonths[jm - 1];
    const schedule = this.shiftCalc.getMonthlySchedule(jy, jm);

    let rowsHtml = '';
    schedule.forEach((day) => {
      const holidayClass = day.isHoliday ? 'text-danger fw-bold' : '';
      const dayColor = day.isFriday ? 'color: #dc2626;' : '';

      rowsHtml += `
        <tr style="${dayColor}">
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${day.day}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;" class="${holidayClass}">${day.weekdayName}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="display:inline-block; padding:2px 8px; border-radius:4px; background:#e0f2fe; color:#0369a1; font-weight:bold;">
              تیم ${day.dayTeam}
            </span>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="display:inline-block; padding:2px 8px; border-radius:4px; background:#fef3c7; color:#b45309; font-weight:bold;">
              تیم ${day.nightTeam}
            </span>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-size: 11px;">
            ${day.events.join(' - ') || '-'}
          </td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>برنامه شیفت کاری - ${monthName} ${jy}</title>
        <style>
          body { font-family: 'Vazirmatn', Tahoma, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #1e293b; }
          h2 { text-align: center; margin-bottom: 5px; color: #0284c7; }
          p.subtitle { text-align: center; margin-top: 0; color: #64748b; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #0284c7; color: white; padding: 8px; border: 1px solid #0369a1; text-align: center; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>تقویم سینا - برنامه شیفت کاری</h2>
        <p class="subtitle">جدول شیفت‌های کاری ماه ${monthName} سال ${jy}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">روز</th>
              <th style="width: 100px;">روز هفته</th>
              <th style="width: 110px;">شیفت روز (روزکاری)</th>
              <th style="width: 110px;">شیفت شب (شبکاری)</th>
              <th>مناسبت‌ها و رویدادها</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
          تولید شده توسط نرم‌افزار تقویم سینا (Taghvim Sina)
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Triggers Print window for a Jalali Month
   * @param {number} jy
   * @param {number} jm
   */
  printMonthlySchedule(jy, jm) {
    const html = this.generatePrintableHtml(jy, jm);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      alert('لطفاً اجازه باز شدن پنجره پاپ‌آپ را بدهید.');
    }
  }

  /**
   * Share monthly text schedule summary
   * @param {number} jy
   * @param {number} jm
   */
  async shareMonthlySchedule(jy, jm) {
    const monthName = this.calendar.persianMonths[jm - 1];
    const schedule = this.shiftCalc.getMonthlySchedule(jy, jm);

    let text = `📅 *برنامه شیفت کاری ${monthName} ${jy}* (تقویم سینا)\n\n`;
    schedule.slice(0, 15).forEach((d) => {
      text += `• ${d.day} ${d.weekdayName}: روزکاری تیم ${d.dayTeam} | شبکاری تیم ${d.nightTeam}\n`;
    });
    text += `\n... برای مشاهده ادامه به نرم‌افزار تقویم سینا مراجعه کنید.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `برنامه شیفت کاری ${monthName} ${jy}`,
          text: text
        });
        return;
      } catch (e) {
        console.log('Share error/cancelled:', e);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert('برنامه شیفت ماهانه در حافظه کپی شد.');
    } catch (e) {
      alert('امکان کپی خودکار وجود ندارد.');
    }
  }

  /**
   * Full System Backup Export (JSON)
   */
  exportFullBackup() {
    const backupData = {
      app: 'Taghvim Sina',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.settingsManager.settings,
      notes: this.notesManager.getAllNotes()
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `taghvim_sina_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Full System Backup Restore (JSON)
   * @param {string} jsonStr
   * @returns {boolean} Success
   */
  importFullBackup(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.app === 'Taghvim Sina') {
        if (data.settings) {
          this.settingsManager.updateSettings(data.settings);
        }
        if (data.notes && Array.isArray(data.notes)) {
          this.notesManager.notes = data.notes;
          this.notesManager.saveNotes();
        }
        return true;
      }
    } catch (e) {
      console.error('[ReportEngine] Backup restore failed:', e);
    }
    return false;
  }
}

window.ReportEngine = ReportEngine;
