/**
 * NotesManager - LocalStorage Notes Persistence for Taghvim Sina
 * Supports CRUD, search, date filtering, backup and restore.
 */

class NotesManager {
  constructor() {
    this.STORAGE_KEY = 'taghvim_sina_notes_v1';
    this.notes = this.loadNotes();
  }

  /**
   * Load notes array from LocalStorage
   * @returns {Array<Object>}
   */
  loadNotes() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[NotesManager] Error loading notes:', e);
      return [];
    }
  }

  /**
   * Save notes array to LocalStorage
   */
  saveNotes() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notes));
    } catch (e) {
      console.error('[NotesManager] Error saving notes:', e);
    }
  }

  /**
   * Add a new note
   * @param {Object} noteData { title, jalaliDate, text, category, color }
   * @returns {Object} Created note
   */
  addNote(noteData) {
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      title: noteData.title || 'بدون عنوان',
      jalaliDate: noteData.jalaliDate || '', // Format YYYY/MM/DD
      text: noteData.text || '',
      category: noteData.category || 'عمومی', // عمومی، کاری، یادآوری، شیفت
      color: noteData.color || '#0284c7',
      createdAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    this.saveNotes();
    return newNote;
  }

  /**
   * Edit an existing note
   * @param {string} id
   * @param {Object} updatedData
   * @returns {boolean} Success status
   */
  updateNote(id, updatedData) {
    const idx = this.notes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notes[idx] = {
        ...this.notes[idx],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveNotes();
      return true;
    }
    return false;
  }

  /**
   * Delete note by ID
   * @param {string} id
   * @returns {boolean} Success status
   */
  deleteNote(id) {
    const initialLen = this.notes.length;
    this.notes = this.notes.filter((n) => n.id !== id);
    if (this.notes.length !== initialLen) {
      this.saveNotes();
      return true;
    }
    return false;
  }

  /**
   * Get all notes
   * @returns {Array<Object>}
   */
  getAllNotes() {
    return this.notes;
  }

  /**
   * Get notes for a specific Jalali Date string (e.g. "۱۴۰۵/۰۴/۲۹" or "1405/04/29")
   * @param {string} jalaliDateStr
   * @returns {Array<Object>}
   */
  getNotesForDate(jalaliDateStr) {
    const cleanDate = (str) => String(str).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim();
    const target = cleanDate(jalaliDateStr);

    return this.notes.filter((n) => {
      const noteDate = cleanDate(n.jalaliDate);
      return noteDate === target;
    });
  }

  /**
   * Search notes by title, text, date or category
   * @param {string} query
   * @returns {Array<Object>}
   */
  searchNotes(query) {
    if (!query || !query.trim()) return this.notes;
    const q = query.trim().toLowerCase();
    return this.notes.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.text.toLowerCase().includes(q) ||
        n.jalaliDate.includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }

  /**
   * Export notes as JSON string
   * @returns {string} JSON
   */
  exportJSON() {
    return JSON.stringify(this.notes, null, 2);
  }

  /**
   * Import notes from JSON string
   * @param {string} jsonStr
   * @returns {boolean} Success status
   */
  importJSON(jsonStr) {
    try {
      const imported = JSON.parse(jsonStr);
      if (Array.isArray(imported)) {
        this.notes = imported;
        this.saveNotes();
        return true;
      }
    } catch (e) {
      console.error('[NotesManager] Failed to import JSON notes:', e);
    }
    return false;
  }
}

window.NotesManager = NotesManager;
