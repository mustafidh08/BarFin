// ============================================================
// api.js — Fetch harga saham dari Yahoo Finance + strategi caching
// Semua fetch dibungkus try/catch, tidak boleh crash aplikasi
// ============================================================

const CORS_PROXY = 'https://corsproxy.io/?';
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const CACHE_DURATION = 15 * 60 * 1000; // 15 menit

/**
 * Ambil harga saham dari Yahoo Finance (dengan CORS proxy)
 * Menggunakan cache LocalStorage jika masih fresh (< 15 menit)
 * Fallback ke cache lama jika API gagal
 * @param {string} kode - Kode saham Indonesia (misal: "BBRI")
 * @returns {Object|null} Data harga saham atau null jika gagal total
 */
async function getHargaSaham(kode) {
  const ticker = kode + '.JK';
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

    const res = await fetch(
      CORS_PROXY + encodeURIComponent(YAHOO_BASE + ticker),
      { signal: controller.signal }
    );
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
    // Fallback: pakai cache lama jika ada
    if (cached) return { ...cached, dari_cache: true, cache_stale: true };
    return null;
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
