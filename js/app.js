// ============================================================
// app.js — Core: toast, modal, dark mode, utils, keyboard shortcuts
// ============================================================

// FASE 2 — jika berkembang jadi multi-user:
// Backend : Node.js + Express
// Database: Supabase (PostgreSQL gratis, ada auth bawaan)
// Auth    : Supabase Auth (login Google)
// Hosting : Vercel (gratis untuk personal project)
// API data: Stockbit Pro atau IDX Data Feed (berbayar)

// ── Dark Mode ──────────────────────────────────────────────
function initDarkMode() {
  const data = getData();
  if (data.settings.dark_mode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.querySelectorAll('[data-toggle-dark]').forEach(btn => {
    btn.addEventListener('click', toggleDarkMode);
  });
}

function toggleDarkMode() {
  const data = getData();
  data.settings.dark_mode = !data.settings.dark_mode;
  saveData(data);
  document.documentElement.classList.toggle('dark', data.settings.dark_mode);
  // Update ikon
  document.querySelectorAll('[data-dark-icon]').forEach(el => {
    el.textContent = data.settings.dark_mode ? '☀️' : '🌙';
  });
}

// ── Toast Notification ─────────────────────────────────────
const toastQueue = [];
let toastActive = false;

function showToast(message, type = 'success', duration = 3000) {
  toastQueue.push({ message, type, duration });
  if (!toastActive) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) { toastActive = false; return; }
  toastActive = true;
  const { message, type, duration } = toastQueue.shift();

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-2';
    document.body.appendChild(container);
  }

  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-white'
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${colors[type] || colors.info} toast-enter min-w-[280px] max-w-[400px] cursor-pointer`;
  toast.innerHTML = `<span class="text-lg">${icons[type] || icons.info}</span><span class="flex-1 text-sm font-medium">${sanitizeInput(message)}</span><button class="opacity-70 hover:opacity-100 text-lg">&times;</button>`;

  toast.querySelector('button').addEventListener('click', () => dismissToast(toast));
  toast.addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.add('toast-exit');
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
    processToastQueue();
  }, 300);
}

// ── Modal System ───────────────────────────────────────────
function openModal(contentHTML, options = {}) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-150';
    document.body.appendChild(overlay);
  }

  const maxW = options.maxWidth || 'max-w-lg';
  overlay.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${maxW} max-h-[90vh] overflow-y-auto modal-content scale-95 transition-transform duration-150" role="dialog" aria-modal="true">
      ${contentHTML}
    </div>`;

  // Tampilkan dengan animasi
  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
    overlay.querySelector('.modal-content').classList.remove('scale-95');
    overlay.querySelector('.modal-content').classList.add('scale-100');
  });

  // Klik backdrop = tutup
  if (!options.persistent) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Escape = tutup
  const escHandler = (e) => {
    if (e.key === 'Escape' && !options.persistent) {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Focus trap — fokus elemen pertama yang bisa di-fokus
  const focusable = overlay.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length > 0) focusable[0].focus();

  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('opacity-100');
  overlay.classList.add('opacity-0');
  const content = overlay.querySelector('.modal-content');
  if (content) { content.classList.remove('scale-100'); content.classList.add('scale-95'); }
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 150);
  document.body.style.overflow = '';
}

// ── Keyboard Shortcuts ─────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Jangan trigger saat user mengetik di input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const shortcuts = {
      'n': () => { if (typeof openAddTransaksiModal === 'function') openAddTransaksiModal(); },
      'd': () => { window.location.href = 'dashboard.html'; },
      't': () => { window.location.href = 'transaksi.html'; },
      'z': () => { window.location.href = 'zakat.html'; },
      'g': () => { window.location.href = 'goals.html'; },
      'i': () => { window.location.href = 'investasi.html'; },
      's': () => { window.location.href = 'pengaturan.html'; },
      '?': () => showShortcutsModal()
    };

    if (shortcuts[e.key]) {
      e.preventDefault();
      shortcuts[e.key]();
    }
  });
}

function showShortcutsModal() {
  openModal(`
    <div class="p-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">⌨️ Keyboard Shortcuts</h3>
      <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div class="flex justify-between"><span>Tambah Transaksi</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">N</kbd></div>
        <div class="flex justify-between"><span>Dashboard</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">D</kbd></div>
        <div class="flex justify-between"><span>Transaksi</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">T</kbd></div>
        <div class="flex justify-between"><span>Zakat</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Z</kbd></div>
        <div class="flex justify-between"><span>Goals</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">G</kbd></div>
        <div class="flex justify-between"><span>Investasi</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">I</kbd></div>
        <div class="flex justify-between"><span>Pengaturan</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">S</kbd></div>
        <div class="flex justify-between"><span>Shortcuts</span><kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">?</kbd></div>
      </div>
      <button onclick="closeModal()" class="mt-6 w-full py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">Tutup</button>
    </div>`);
}

// ── Utility Functions ──────────────────────────────────────
function formatTanggal(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTanggalLengkap(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getBulanIni() {
  const now = new Date();
  return { bulan: now.getMonth(), tahun: now.getFullYear() };
}

function getTransaksiBulanIni(data) {
  const { bulan, tahun } = getBulanIni();
  return data.transaksi.filter(t => {
    const d = new Date(t.tanggal);
    return d.getMonth() === bulan && d.getFullYear() === tahun;
  });
}

function getTotalPemasukan(transaksi) {
  return transaksi.filter(t => t.tipe === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
}

function getTotalPengeluaran(transaksi) {
  return transaksi.filter(t => t.tipe === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
}

function getTotalSaldo(data) {
  const pemasukan = data.transaksi.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.jumlah, 0);
  const pengeluaran = data.transaksi.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.jumlah, 0);
  return pemasukan - pengeluaran;
}

function getDeltaBulanLalu(data, tipe) {
  const now = new Date();
  const bulanIni = now.getMonth();
  const tahunIni = now.getFullYear();
  const bulanLalu = bulanIni === 0 ? 11 : bulanIni - 1;
  const tahunLalu = bulanIni === 0 ? tahunIni - 1 : tahunIni;

  const transBulanIni = data.transaksi.filter(t => {
    const d = new Date(t.tanggal);
    return d.getMonth() === bulanIni && d.getFullYear() === tahunIni && t.tipe === tipe;
  }).reduce((s, t) => s + t.jumlah, 0);

  const transBulanLalu = data.transaksi.filter(t => {
    const d = new Date(t.tanggal);
    return d.getMonth() === bulanLalu && d.getFullYear() === tahunLalu && t.tipe === tipe;
  }).reduce((s, t) => s + t.jumlah, 0);

  if (transBulanLalu === 0) return null;
  return ((transBulanIni - transBulanLalu) / transBulanLalu * 100).toFixed(1);
}

// Debounce utility
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Sidebar & Navigation ──────────────────────────────────
function getActivePage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const data = getData();
  const inisial = data.user.nama ? data.user.nama.charAt(0).toUpperCase() : '?';
  const active = getActivePage();

  const menuItems = [
    { href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: 'transaksi.html', icon: '💳', label: 'Transaksi' },
    { href: 'zakat.html', icon: '🕌', label: 'Zakat' },
    { href: 'goals.html', icon: '🎯', label: 'Goals' },
    { href: 'investasi.html', icon: '📈', label: 'Investasi' },
    { href: 'edukasi.html', icon: '📚', label: 'Edukasi' },
    { href: 'pengaturan.html', icon: '⚙️', label: 'Pengaturan' },
  ];

  sidebar.innerHTML = `
    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
      <a href="index.html" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
        </div>
        <span class="text-base font-bold text-gray-900 dark:text-white">KeuanganSyariah</span>
      </a>
    </div>
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">${inisial}</div>
      <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${sanitizeInput(data.user.nama) || 'Pengguna'}</p><p class="text-xs text-gray-500 dark:text-gray-400">Personal</p></div>
    </div>
    <nav class="flex-1 p-3 space-y-1">
      ${menuItems.map(m => {
        const isActive = active === m.href;
        return `<a href="${m.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}"><span>${m.icon}</span><span>${m.label}</span></a>`;
      }).join('')}
    </nav>
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <button data-toggle-dark class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
        <span data-dark-icon>${data.settings.dark_mode ? '☀️' : '🌙'}</span><span>Mode ${data.settings.dark_mode ? 'Terang' : 'Gelap'}</span>
      </button>
    </div>`;

  // Re-bind dark mode toggle setelah render
  sidebar.querySelectorAll('[data-toggle-dark]').forEach(btn => {
    btn.addEventListener('click', toggleDarkMode);
  });
}

function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const active = getActivePage();
  const items = [
    { href: 'dashboard.html', icon: '📊', label: 'Home' },
    { href: 'transaksi.html', icon: '💳', label: 'Transaksi' },
    { href: 'zakat.html', icon: '🕌', label: 'Zakat' },
    { href: 'goals.html', icon: '🎯', label: 'Goals' },
    { href: 'investasi.html', icon: '📈', label: 'Investasi' },
    { href: 'pengaturan.html', icon: '⚙️', label: 'Lainnya' },
  ];
  nav.innerHTML = items.map(m => {
    const isActive = active === m.href;
    return `<a href="${m.href}" class="flex flex-col items-center justify-center gap-0.5 py-1 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}"><span class="text-lg">${m.icon}</span><span class="text-[10px] font-medium">${m.label}</span></a>`;
  }).join('');
}

// ── Quotes Harian ──────────────────────────────────────────
const DAILY_QUOTES = [
  { text: "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji.", source: "QS. Al-Baqarah: 261" },
  { text: "Dan janganlah kamu menghambur-hamburkan (hartamu) secara boros. Sesungguhnya orang-orang yang pemboros itu adalah saudara setan.", source: "QS. Al-Isra: 26-27" },
  { text: "Harta tidak akan berkurang karena sedekah.", source: "HR. Muslim" },
  { text: "Tangan di atas lebih baik daripada tangan di bawah.", source: "HR. Bukhari & Muslim" },
  { text: "Barangsiapa yang bertakwa kepada Allah, niscaya Dia akan memberikan jalan keluar dan memberinya rezeki dari arah yang tidak disangka-sangka.", source: "QS. At-Talaq: 2-3" },
  { text: "Sesungguhnya Allah tidak mengubah keadaan suatu kaum hingga mereka mengubah keadaan diri mereka sendiri.", source: "QS. Ar-Ra'd: 11" },
  { text: "Tidaklah seorang muslim menanam tanaman, kemudian dimakan oleh burung, manusia, atau binatang, melainkan itu menjadi sedekah baginya.", source: "HR. Bukhari" },
  { text: "Simpanlah sebagian dari hartamu untuk kebaikan masa depanmu, karena itu lebih baik bagimu.", source: "HR. Bukhari" },
  { text: "Hai orang-orang yang beriman, bertakwalah kepada Allah dan hendaklah setiap diri memperhatikan apa yang telah diperbuatnya untuk hari esok.", source: "QS. Al-Hasyr: 18" },
  { text: "Orang yang beriman yang paling sempurna imannya adalah yang paling baik akhlaknya, dan sebaik-baik kamu adalah yang paling baik kepada keluarganya.", source: "HR. Tirmidzi" },
  { text: "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan menyucikan mereka.", source: "QS. At-Taubah: 103" },
  { text: "Infakkanlah (hartamu) di jalan Allah, dan janganlah kamu jatuhkan (diri sendiri) ke dalam kebinasaan dengan tangan sendiri.", source: "QS. Al-Baqarah: 195" },
];

function getQuoteHariIni() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}

// ── Skeleton Loader ────────────────────────────────────────
function skeleton(type = 'text', count = 1) {
  const templates = {
    text: '<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>',
    card: '<div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>',
    stat: '<div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>',
    row: '<div class="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>',
  };
  return Array(count).fill(templates[type] || templates.text).join('');
}

// ── Inisialisasi ───────────────────────────────────────────
function initApp() {
  initDarkMode();
  renderSidebar();
  renderBottomNav();
  initKeyboardShortcuts();
}

// Auto-init saat DOM ready (untuk halaman app, bukan landing)
document.addEventListener('DOMContentLoaded', () => {
  if (getActivePage() !== 'index.html') {
    initApp();
  }
});

// ── Service Worker Registration (PWA) ──────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW Registered!', reg))
      .catch(err => console.error('SW Registration Failed!', err));
  });
}
