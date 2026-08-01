/**
 * SettingsManager - Configuration persistence for Taghvim Sina
 * Manages app themes, team colors, shift reference settings, font sizes.
 */

class SettingsManager {
  constructor() {
    this.STORAGE_KEY = 'taghvim_sina_settings_v1';
    this.defaultSettings = {
      theme: 'dark', // 'dark' | 'light'
      fontSize: 'medium', // 'small' | 'medium' | 'large'
      refJalaliYear: 1405,
      refJalaliMonth: 4, // Tir
      refJalaliDay: 29,
      refHour: 7,
      refMinute: 0,
      refTeam: 2,
      shiftDurationHours: 12,
      dayShiftStartHour: 7,
      nightShiftStartHour: 19,
      rotationOrder: [1, 3, 5, 2, 4],
      teamCount: 5,
      teamColors: {
        1: '#3b82f6', // Blue
        2: '#10b981', // Emerald Green
        3: '#f59e0b', // Amber/Orange
        4: '#ec4899', // Pink
        5: '#8b5cf6'  // Purple
      }
    };

    this.settings = this.loadSettings();
    this.applyTheme();
    this.applyFontSize();
  }

  /**
   * Load settings from LocalStorage
   * @returns {Object} Settings
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('[SettingsManager] Error loading settings:', e);
    }
    return { ...this.defaultSettings };
  }

  /**
   * Save current settings to LocalStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('[SettingsManager] Error saving settings:', e);
    }
  }

  /**
   * Update one or more setting values
   * @param {Object} partialSettings
   */
  updateSettings(partialSettings) {
    this.settings = { ...this.settings, ...partialSettings };
    this.saveSettings();
    this.applyTheme();
    this.applyFontSize();
  }

  /**
   * Reset settings to factory defaults
   */
  resetToDefaults() {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
    this.applyTheme();
    this.applyFontSize();
  }

  /**
   * Apply Theme (dark/light) to documentBody
   */
  applyTheme() {
    const isDark = (this.settings.theme === 'dark');
    if (isDark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  /**
   * Apply Font Size to documentBody
   */
  applyFontSize() {
    document.body.classList.remove('fs-small', 'fs-medium', 'fs-large');
    document.body.classList.add(`fs-${this.settings.fontSize}`);
  }

  /**
   * Get team color by Team ID
   * @param {number} teamId
   * @returns {string} Hex color
   */
  getTeamColor(teamId) {
    return this.settings.teamColors[teamId] || '#3b82f6';
  }
}

window.SettingsManager = SettingsManager;
