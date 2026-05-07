export default async function handler(req, res) {
  // Hanya menerima metode GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mengizinkan CORS agar bisa diakses dari frontend mana saja
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { kode } = req.query;

  if (!kode) {
    return res.status(400).json({ error: 'Parameter "kode" dibutuhkan' });
  }

  const ticker = `${kode.toUpperCase()}.JK`;
  const YAHOO_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;

  try {
    const response = await fetch(YAHOO_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return data persis seperti yang dikirim Yahoo
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Saham Error:', error);
    return res.status(500).json({ error: 'Gagal mengambil data dari Yahoo Finance', message: error.message });
  }
}
