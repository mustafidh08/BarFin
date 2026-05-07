// ============================================================
// saham-syariah.js — Daftar Efek Syariah (DES) OJK
// Data di-hardcode karena hanya update 2x/tahun (Mei & November)
// Sumber resmi: ojk.go.id → Pasar Modal → Daftar Efek Syariah
// ============================================================

const SAHAM_SYARIAH = [
  { kode: "TLKM", nama: "Telekomunikasi Indonesia Tbk", sektor: "Telekomunikasi", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "ASII", nama: "Astra International Tbk", sektor: "Otomotif", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "UNVR", nama: "Unilever Indonesia Tbk", sektor: "Konsumer", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "ICBP", nama: "Indofood CBP Sukses Makmur Tbk", sektor: "Makanan & Minuman", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "SIDO", nama: "Industri Jamu & Farmasi Sido Muncul Tbk", sektor: "Farmasi", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "KLBF", nama: "Kalbe Farma Tbk", sektor: "Farmasi", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "INDF", nama: "Indofood Sukses Makmur Tbk", sektor: "Makanan & Minuman", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "EXCL", nama: "XL Axiata Tbk", sektor: "Telekomunikasi", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "BRIS", nama: "Bank Syariah Indonesia Tbk", sektor: "Perbankan Syariah", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "CPIN", nama: "Charoen Pokphand Indonesia Tbk", sektor: "Peternakan", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "SMGR", nama: "Semen Indonesia Tbk", sektor: "Semen", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "ANTM", nama: "Aneka Tambang Tbk", sektor: "Pertambangan", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "PTBA", nama: "Bukit Asam Tbk", sektor: "Pertambangan", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "INCO", nama: "Vale Indonesia Tbk", sektor: "Pertambangan", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "PGAS", nama: "Perusahaan Gas Negara Tbk", sektor: "Energi", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "JSMR", nama: "Jasa Marga Tbk", sektor: "Infrastruktur", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "WIKA", nama: "Wijaya Karya Tbk", sektor: "Konstruksi", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "PWON", nama: "Pakuwon Jati Tbk", sektor: "Properti", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "JPFA", nama: "Japfa Comfeed Indonesia Tbk", sektor: "Peternakan", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "ERAA", nama: "Erajaya Swasembada Tbk", sektor: "Perdagangan", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "AKRA", nama: "AKR Corporindo Tbk", sektor: "Perdagangan", indeks: ["ISSI", "JII"], des_periode: "II/2024" },
  { kode: "TOWR", nama: "Sarana Menara Nusantara Tbk", sektor: "Telekomunikasi", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "TBIG", nama: "Tower Bersama Infrastructure Tbk", sektor: "Telekomunikasi", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "MIKA", nama: "Mitra Keluarga Karyasehat Tbk", sektor: "Kesehatan", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "ACES", nama: "Ace Hardware Indonesia Tbk", sektor: "Perdagangan", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "MDKA", nama: "Merdeka Copper Gold Tbk", sektor: "Pertambangan", indeks: ["ISSI"], des_periode: "II/2024" },
  { kode: "BRPT", nama: "Barito Pacific Tbk", sektor: "Petrokimia", indeks: ["ISSI"], des_periode: "II/2024" }
];

const DES_METADATA = {
  periode: "II/2024",
  tanggal_berlaku: "2024-12-01",
  update_berikutnya: "Mei 2025",
  sumber: "https://www.ojk.go.id/id/kanal/pasar-modal/data-dan-statistik/daftar-efek-syariah/"
};

/**
 * Cek apakah suatu kode saham terdaftar di DES OJK
 * @param {string} kode - Kode saham (misal: "BBRI")
 * @returns {boolean}
 */
function isSahamSyariah(kode) {
  return SAHAM_SYARIAH.some(s => s.kode === kode.toUpperCase());
}

/**
 * Ambil data saham syariah berdasarkan kode
 * @param {string} kode - Kode saham
 * @returns {Object|null} Data saham atau null jika tidak ditemukan
 */
function getSahamByKode(kode) {
  return SAHAM_SYARIAH.find(s => s.kode === kode.toUpperCase()) || null;
}

/**
 * Ambil daftar saham berdasarkan sektor
 * @param {string} sektor - Nama sektor
 * @returns {Array} Daftar saham di sektor tersebut
 */
function getSahamBySektor(sektor) {
  return SAHAM_SYARIAH.filter(s => s.sektor.toLowerCase() === sektor.toLowerCase());
}

/**
 * Ambil daftar saham berdasarkan indeks (JII/ISSI)
 * @param {string} indeks - Nama indeks ("JII" atau "ISSI")
 * @returns {Array} Daftar saham di indeks tersebut
 */
function getSahamByIndeks(indeks) {
  return SAHAM_SYARIAH.filter(s => s.indeks.includes(indeks.toUpperCase()));
}

/**
 * Ambil semua sektor unik
 * @returns {Array<string>} Daftar sektor unik
 */
function getAllSektor() {
  return [...new Set(SAHAM_SYARIAH.map(s => s.sektor))];
}
