// ============================================================
// api.js — Fetch harga saham dari Yahoo Finance + strategi caching
// Semua fetch dibungkus try/catch, tidak boleh crash aplikasi
// ============================================================

const API_URL = '/api/saham?kode=';
const CACHE_DURATION = 15 * 60 * 1000; // 15 menit

/**
 * Generate mock data (fallback jika API lokal belum jalan)
 */
function getMockSahamData(kode) {
  const basePrice = { 'BBRI': 4800, 'BBCA': 9800, 'TLKM': 3200, 'ASII': 5100, 'ICBP': 11200, 'SIDO': 750, 'KLBF': 1500, 'BRIS': 2400 };
  const price = basePrice[kode] || Math.floor(Math.random() * 5000) + 1000;
  const change = Math.floor(Math.random() * 100) - 50;
  return {
    kode,
    harga: price,
    perubahan: change,
    perubahan_persen: ((change / (price - change)) * 100).toFixed(2),
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    timestamp: Date.now()
  };
}

/**
 * Ambil harga saham dari Yahoo Finance (via Vercel Serverless Function)
 * Menggunakan cache LocalStorage jika masih fresh (< 15 menit)
 * Fallback ke mock data jika API gagal (misal sedang tes lokal)
 * @param {string} kode - Kode saham Indonesia (misal: "BBRI")
 * @returns {Object|null} Data harga saham
 */
async function getHargaSaham(kode) {
  const cacheKey = 'harga_' + kode;
  const data = getData();

  // Pakai cache jika masih fresh
  const cached = data.harga_cache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return { ...cached, dari_cache: true };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(API_URL + kode, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('API gagal: ' + res.status);

    const json = await res.json();
    const meta = json.chart.result[0].meta;
    const previousClose = meta.chartPreviousClose || meta.previousClose;

    const result = {
      kode,
      harga: meta.regularMarketPrice,
      perubahan: meta.regularMarketPrice - previousClose,
      perubahan_persen: ((meta.regularMarketPrice - previousClose) / previousClose * 100).toFixed(2),
      volume: meta.regularMarketVolume,
      timestamp: Date.now()
    };

    // Simpan ke cache di LocalStorage
    data.harga_cache[cacheKey] = result;
    saveData(data);

    return { ...result, dari_cache: false };

  } catch (err) {
    // Fallback 1: pakai cache lama jika ada
    if (cached) return { ...cached, dari_cache: true, cache_stale: true };
    
    // Fallback 2: Generate mock data jika serverless belum berjalan (e.g. tes lokal tanpa Vercel CLI)
    const mock = getMockSahamData(kode);
    mock.cache_stale = true; // Tandai sebagai offline/mock
    return mock;
  }
}

/**
 * Fetch harga beberapa saham sekaligus dengan jeda 200ms
 * Mencegah rate limiting dari Yahoo Finance
 * @param {Array<string>} daftarKode - Array kode saham
 * @returns {Object} Map { kode: dataHarga }
 */
async function getHargaMultipleSaham(daftarKode) {
  const results = {};
  for (const kode of daftarKode) {
    results[kode] = await getHargaSaham(kode);
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

/**
 * Render status data (cache/live/offline) sebagai HTML
 * @param {Object} hargaData - Hasil dari getHargaSaham()
 * @returns {string} HTML string untuk badge status
 */
function renderStatusHarga(hargaData) {
  if (!hargaData) {
    return '<span class="text-xs text-gray-400 dark:text-gray-500">Gagal memuat</span>';
  }
  if (hargaData.cache_stale) {
    return '<span class="text-xs text-amber-500">⚠️ Data offline</span>';
  }
  if (hargaData.dari_cache) {
    const menit = Math.round((Date.now() - hargaData.timestamp) / 60000);
    return `<span class="text-xs text-gray-400 dark:text-gray-500">🕐 ${menit} mnt lalu</span>`;
  }
  return '<span class="text-xs text-emerald-500">● Live</span>';
}

/**
 * Render perubahan harga (naik/turun) sebagai HTML
 * @param {Object} hargaData - Hasil dari getHargaSaham()
 * @returns {string} HTML string untuk perubahan harga
 */
function renderPerubahanHarga(hargaData) {
  if (!hargaData || hargaData.harga === undefined) {
    return '<span class="text-gray-400">—</span>';
  }
  const isUp = hargaData.perubahan >= 0;
  const colorClass = isUp ? 'text-emerald-500' : 'text-red-500';
  const arrow = isUp ? '▲' : '▼';
  const sign = isUp ? '+' : '';
  return `<span class="${colorClass} font-semibold">${arrow} ${sign}${hargaData.perubahan_persen}%</span>`;
}
