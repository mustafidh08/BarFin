export default async function handler(req, res) {
  // ── Security: Hanya menerima metode GET ──────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Security: CORS — hanya dari domain kita ──────────────
  const origin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache 5 menit

  // ── Security: Input Validation ───────────────────────────
  const { kode } = req.query;

  if (!kode) {
    return res.status(400).json({ error: 'Parameter "kode" dibutuhkan' });
  }

  // Sanitasi: kode saham hanya boleh huruf (A-Z) dan max 6 karakter
  const sanitizedKode = kode.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
  if (!sanitizedKode || sanitizedKode.length < 2) {
    return res.status(400).json({ error: 'Kode saham tidak valid' });
  }

  // ── Security: Rate limiting sederhana via header ─────────
  // Vercel Edge akan menangani DDoS, tapi kita bisa batasi parameter
  const ticker = `${sanitizedKode}.JK`;
  const YAHOO_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(YAHOO_URL, {
      headers: {
        'User-Agent': 'KeuanganSyariah/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // ── Security: Jangan bocorkan detail error internal ───
    console.error('API Saham Error:', error.message);
    const status = error.name === 'AbortError' ? 504 : 500;
    return res.status(status).json({ error: 'Gagal mengambil data saham' });
  }
}

/**
 * Batasi CORS hanya ke domain yang diizinkan
 */
function getAllowedOrigin(req) {
  const origin = req.headers?.origin || '';
  const allowed = [
    'https://bar-fin.vercel.app',
    'http://localhost:3456',
    'http://127.0.0.1:3456',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  if (allowed.some(a => origin.startsWith(a))) {
    return origin;
  }
  return allowed[0]; // Default ke production
}
