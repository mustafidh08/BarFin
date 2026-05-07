// ============================================================
// storage.js — Satu-satunya layer baca/tulis LocalStorage
// Semua modul lain WAJIB melalui file ini untuk akses data
// ============================================================

const STORAGE_KEY = 'ks_data';

// Schema default — digunakan saat pertama kali atau reset
const DEFAULT_DATA = {
  user: {
    nama: '',
    nisab_harga_emas_per_gram: 950000,
    mata_uang: 'IDR',
    onboarded: false
  },
  transaksi: [],
  goals: [],
  zakat_history: [],
  risk_profile: {
    sudah_isi_quiz: false,
    hasil: null,
    skor_total: 0,
    jawaban: [],
    tanggal_assessment: null,
    tanggal_reassessment: null
  },
  harga_cache: {},
  settings: {
    dark_mode: false,
    reminder_zakat: true,
    reminder_sedekah_jumat: true
  }
};

/**
 * Ambil seluruh data aplikasi dari LocalStorage
 * Jika belum ada data, kembalikan schema default
 * @returns {Object} Data aplikasi lengkap
 */
function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Pertama kali — simpan schema default
      const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_DATA));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCopy));
      return defaultCopy;
    }
    const parsed = JSON.parse(raw);
    // Merge dengan default untuk field yang mungkin belum ada (backward compat)
    return mergeWithDefaults(parsed, DEFAULT_DATA);
  } catch (err) {
    console.warn('storage.js: Gagal membaca LocalStorage, menggunakan default', err);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

/**
 * Simpan seluruh data aplikasi ke LocalStorage
 * @param {Object} data - Data lengkap yang akan disimpan
 */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Background sync ke Supabase (jika function tersedia & user login)
    if (typeof syncToCloud === 'function') {
      syncToCloud(data).catch(err => console.error('Background sync failed:', err));
    }
  } catch (err) {
    // Kemungkinan: QuotaExceededError (LocalStorage penuh ~5-10MB)
    console.error('storage.js: Gagal menyimpan ke LocalStorage', err);
    if (err.name === 'QuotaExceededError') {
      // Bersihkan cache harga saham yang sudah expired
      if (data.harga_cache) {
        const now = Date.now();
        const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 jam
        Object.keys(data.harga_cache).forEach(key => {
          if (now - data.harga_cache[key].timestamp > CACHE_MAX_AGE) {
            delete data.harga_cache[key];
          }
        });
        // Coba simpan lagi
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          alert('Penyimpanan browser penuh. Silakan hapus beberapa data atau bersihkan cache browser.');
        }
      }
    }
  }
}

/**
 * Generate UUID v4 untuk ID unik
 * @returns {string} UUID v4
 */
function generateId() {
  // Menggunakan crypto.randomUUID jika tersedia, fallback ke manual
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Reset seluruh data ke schema default
 * Menghapus semua transaksi, goals, riwayat zakat, dll.
 */
function resetData() {
  const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_DATA));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCopy));
  return defaultCopy;
}

/**
 * Merge data yang sudah ada dengan default schema
 * Berguna saat ada field baru ditambahkan di update mendatang
 * @param {Object} existing - Data dari LocalStorage
 * @param {Object} defaults - Schema default
 * @returns {Object} Data yang sudah di-merge
 */
function mergeWithDefaults(existing, defaults) {
  const result = { ...existing };
  for (const key of Object.keys(defaults)) {
    if (!(key in result)) {
      result[key] = JSON.parse(JSON.stringify(defaults[key]));
    } else if (
      typeof defaults[key] === 'object' &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = mergeWithDefaults(result[key] || {}, defaults[key]);
    }
  }
  return result;
}

/**
 * Sanitasi input string dari user — cegah XSS
 * @param {string} str - String input user
 * @returns {string} String yang sudah di-sanitasi
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format angka ke format Rupiah Indonesia
 * @param {number} amount - Jumlah uang
 * @returns {string} Format Rupiah (contoh: "Rp 1.250.000")
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Hitung ukuran data di LocalStorage (dalam bytes)
 * Berguna untuk monitoring kapasitas
 * @returns {number} Ukuran dalam bytes
 */
function getStorageSize() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;
  return new Blob([data]).size;
}

/**
 * Export semua data sebagai JSON string (untuk backup)
 * @returns {string} JSON string data
 */
function exportData() {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify(DEFAULT_DATA);
}

/**
 * Import data dari JSON string (untuk restore backup)
 * @param {string} jsonString - JSON string data
 * @returns {boolean} Berhasil atau tidak
 */
function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    // Validasi minimal: harus punya field 'user'
    if (!parsed.user) {
      throw new Error('Format data tidak valid');
    }
    const merged = mergeWithDefaults(parsed, DEFAULT_DATA);
    saveData(merged);
    return true;
  } catch (err) {
    console.error('storage.js: Gagal import data', err);
    return false;
  }
}
