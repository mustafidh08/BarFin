// ============================================================
// transaksi.js — Logic CRUD transaksi, filter, search, pagination
// ============================================================

const KATEGORI_PEMASUKAN = ['Gaji/Upah', 'Freelance', 'Bisnis', 'Investasi Halal', 'Hibah/Hadiah', 'Lainnya'];
const KATEGORI_PENGELUARAN = ['Makanan & Minuman', 'Transport', 'Ibadah & Sedekah', 'Tagihan', 'Pendidikan', 'Kesehatan', 'Hiburan', 'Tabungan', 'Investasi Halal', 'Lainnya'];
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let currentFilter = { tipe: 'semua', label: 'semua', sort: 'terbaru', search: '' };

function openAddTransaksiModal(defaultTipe) {
  const tipe = defaultTipe || 'pemasukan';
  openModal(`
    <div class="p-6">
      <h3 class="text-lg font-bold mb-5">Tambah Transaksi</h3>
      <!-- Tipe Toggle -->
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-5">
        <button id="pill-pemasukan" onclick="switchTipe('pemasukan')" class="flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tipe === 'pemasukan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}">📈 Pemasukan</button>
        <button id="pill-pengeluaran" onclick="switchTipe('pengeluaran')" class="flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tipe === 'pengeluaran' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}">📉 Pengeluaran</button>
      </div>
      <input type="hidden" id="form-tipe" value="${tipe}">
      <!-- Jumlah -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Jumlah (Rp)</label>
        <input id="form-jumlah" type="text" placeholder="0" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono text-lg text-right" oninput="formatJumlahInput(this); validateForm();">
        <p id="err-jumlah" class="text-xs text-red-500 mt-1 hidden">Jumlah harus lebih dari 0</p>
      </div>
      <!-- Kategori -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Kategori</label>
        <select id="form-kategori" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition" onchange="validateForm()">
          <option value="">Pilih kategori</option>
          ${(tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map(k => `<option value="${k}">${k}</option>`).join('')}
        </select>
        <p id="err-kategori" class="text-xs text-red-500 mt-1 hidden">Pilih kategori</p>
      </div>
      <!-- Label Syariah -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Label Syariah</label>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" onclick="selectLabel('halal')" id="label-halal" class="py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500" title="Transaksi yang jelas halal">✅ Halal</button>
          <button type="button" onclick="selectLabel('syubhat')" id="label-syubhat" class="py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-center text-sm font-semibold text-gray-600 dark:text-gray-400" title="Transaksi yang masih meragukan kehalalan/keharamannya">⚠️ Syubhat</button>
          <button type="button" onclick="selectLabel('haram')" id="label-haram" class="py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-center text-sm font-semibold text-gray-600 dark:text-gray-400" title="Transaksi yang jelas haram">❌ Haram</button>
        </div>
        <input type="hidden" id="form-label" value="halal">
      </div>
      <!-- Catatan -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Catatan (opsional)</label>
        <textarea id="form-catatan" rows="2" placeholder="Tambahkan catatan..." class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none text-sm"></textarea>
      </div>
      <!-- Tanggal -->
      <div class="mb-5">
        <label class="block text-sm font-medium mb-1.5">Tanggal</label>
        <input id="form-tanggal" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition">
      </div>
      <button id="btn-simpan" onclick="simpanTransaksi()" class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>Simpan Transaksi</button>
    </div>`, { maxWidth: 'max-w-md' });
}

function switchTipe(tipe) {
  document.getElementById('form-tipe').value = tipe;
  const pBtn = document.getElementById('pill-pemasukan');
  const eBtn = document.getElementById('pill-pengeluaran');
  if (tipe === 'pemasukan') {
    pBtn.className = 'flex-1 py-2.5 text-sm font-semibold rounded-lg transition bg-emerald-600 text-white shadow-sm';
    eBtn.className = 'flex-1 py-2.5 text-sm font-semibold rounded-lg transition text-gray-600 dark:text-gray-400';
  } else {
    eBtn.className = 'flex-1 py-2.5 text-sm font-semibold rounded-lg transition bg-red-600 text-white shadow-sm';
    pBtn.className = 'flex-1 py-2.5 text-sm font-semibold rounded-lg transition text-gray-600 dark:text-gray-400';
  }
  const sel = document.getElementById('form-kategori');
  const cats = tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;
  sel.innerHTML = '<option value="">Pilih kategori</option>' + cats.map(k => `<option value="${k}">${k}</option>`).join('');
  validateForm();
}

function selectLabel(label) {
  document.getElementById('form-label').value = label;
  ['halal', 'syubhat', 'haram'].forEach(l => {
    const btn = document.getElementById('label-' + l);
    if (l === label) {
      const colors = { halal: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500', syubhat: 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500', haram: 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-2 ring-red-500' };
      btn.className = `py-3 rounded-xl border-2 text-center text-sm font-semibold ${colors[l]}`;
    } else {
      btn.className = 'py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-center text-sm font-semibold text-gray-600 dark:text-gray-400';
    }
  });
}

function formatJumlahInput(el) {
  let raw = el.value.replace(/\D/g, '');
  if (raw) el.value = new Intl.NumberFormat('id-ID').format(parseInt(raw));
  else el.value = '';
}

function validateForm() {
  const jumlahRaw = (document.getElementById('form-jumlah').value || '').replace(/\D/g, '');
  const kategori = document.getElementById('form-kategori').value;
  const errJ = document.getElementById('err-jumlah');
  const errK = document.getElementById('err-kategori');
  let valid = true;

  if (!jumlahRaw || parseInt(jumlahRaw) <= 0) {
    errJ.classList.remove('hidden'); valid = false;
  } else { errJ.classList.add('hidden'); }

  if (!kategori) {
    errK.classList.remove('hidden'); valid = false;
  } else { errK.classList.add('hidden'); }

  document.getElementById('btn-simpan').disabled = !valid;
  return valid;
}

function simpanTransaksi() {
  if (!validateForm()) return;
  const data = getData();
  const t = {
    id: generateId(),
    tipe: document.getElementById('form-tipe').value,
    jumlah: parseInt(document.getElementById('form-jumlah').value.replace(/\D/g, '')),
    kategori: document.getElementById('form-kategori').value,
    label_syariah: document.getElementById('form-label').value,
    catatan: sanitizeInput(document.getElementById('form-catatan').value.trim()),
    tanggal: document.getElementById('form-tanggal').value + 'T00:00:00',
    created_at: new Date().toISOString()
  };
  data.transaksi.push(t);
  saveData(data);
  closeModal();
  showToast('Transaksi berhasil disimpan!', 'success');
  renderTransaksiList();
  renderTransaksiSummary();
}

function hapusTransaksi(id) {
  openModal(`
    <div class="p-6 text-center">
      <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
      <h3 class="text-lg font-bold mb-2">Hapus Transaksi?</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Tindakan ini tidak bisa dibatalkan.</p>
      <div class="flex gap-3">
        <button onclick="closeModal()" class="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Batal</button>
        <button onclick="konfirmasiHapus('${id}')" class="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Hapus</button>
      </div>
    </div>`, { maxWidth: 'max-w-sm' });
}

function konfirmasiHapus(id) {
  const data = getData();
  data.transaksi = data.transaksi.filter(t => t.id !== id);
  saveData(data);
  closeModal();
  showToast('Transaksi dihapus', 'info');
  renderTransaksiList();
  renderTransaksiSummary();
}

function getFilteredTransaksi() {
  const data = getData();
  let list = [...data.transaksi];
  if (currentFilter.tipe === 'pemasukan') list = list.filter(t => t.tipe === 'pemasukan');
  else if (currentFilter.tipe === 'pengeluaran') list = list.filter(t => t.tipe === 'pengeluaran');
  else if (currentFilter.tipe === 'bulan_ini') {
    const { bulan, tahun } = getBulanIni();
    list = list.filter(t => { const d = new Date(t.tanggal); return d.getMonth() === bulan && d.getFullYear() === tahun; });
  }
  if (currentFilter.label !== 'semua') list = list.filter(t => t.label_syariah === currentFilter.label);
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    list = list.filter(t => (t.catatan && t.catatan.toLowerCase().includes(q)) || t.kategori.toLowerCase().includes(q));
  }
  // Sort
  if (currentFilter.sort === 'terbaru') list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  else if (currentFilter.sort === 'terlama') list.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  else if (currentFilter.sort === 'terbesar') list.sort((a, b) => b.jumlah - a.jumlah);
  else if (currentFilter.sort === 'terkecil') list.sort((a, b) => a.jumlah - b.jumlah);
  return list;
}

function renderTransaksiList() {
  const container = document.getElementById('transaksi-list');
  if (!container) return;
  const list = getFilteredTransaksi();
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paged = list.slice(start, start + ITEMS_PER_PAGE);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-20 h-20 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12h6M12 9v6"/></svg>
        <p class="text-base mb-2">Belum ada transaksi</p>
        <p class="text-sm mb-4">Mulai catat pemasukan dan pengeluaranmu</p>
        <button onclick="openAddTransaksiModal()" class="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition">+ Tambah Transaksi</button>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  container.innerHTML = paged.map(t => {
    const isIncome = t.tipe === 'pemasukan';
    const labelClass = t.label_syariah === 'halal' ? 'label-halal' : t.label_syariah === 'syubhat' ? 'label-syubhat' : 'label-haram';
    return `
      <div class="flex items-center gap-3 py-3.5 px-4 bg-white dark:bg-gray-800 rounded-xl mb-2 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isIncome ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}">${isIncome ? '📈' : '📉'}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold truncate">${sanitizeInput(t.kategori)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${formatTanggal(t.tanggal)}${t.catatan ? ' · ' + sanitizeInput(t.catatan).substring(0, 40) : ''}</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${labelClass} shrink-0">${t.label_syariah}</span>
        <p class="text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'} shrink-0 w-28 text-right">${isIncome ? '+' : '-'}${formatRupiah(t.jumlah)}</p>
        <button onclick="hapusTransaksi('${t.id}')" class="p-1.5 text-gray-400 hover:text-red-500 transition shrink-0" title="Hapus">🗑️</button>
      </div>`;
  }).join('');

  // Pagination
  const pagEl = document.getElementById('pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHTML = '<div class="flex items-center justify-center gap-2 mt-6">';
  pagHTML += `<button onclick="goPage(${currentPage - 1})" class="px-3 py-1.5 rounded-lg text-sm ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    pagHTML += `<button onclick="goPage(${i})" class="w-9 h-9 rounded-lg text-sm font-medium ${i === currentPage ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}">${i}</button>`;
  }
  pagHTML += `<button onclick="goPage(${currentPage + 1})" class="px-3 py-1.5 rounded-lg text-sm ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;
  pagHTML += '</div>';
  pagEl.innerHTML = pagHTML;
}

function goPage(p) {
  const list = getFilteredTransaksi();
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTransaksiList();
}

function setFilter(key, value) {
  currentFilter[key] = value;
  currentPage = 1;
  renderTransaksiList();
}

function renderTransaksiSummary() {
  const el = document.getElementById('transaksi-summary');
  if (!el) return;
  const data = getData();
  const transBulanIni = getTransaksiBulanIni(data);
  const pemasukan = getTotalPemasukan(transBulanIni);
  const pengeluaran = getTotalPengeluaran(transBulanIni);
  el.innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
        <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Pemasukan Bulan Ini</p>
        <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300">${formatRupiah(pemasukan)}</p>
      </div>
      <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800/30">
        <p class="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Pengeluaran Bulan Ini</p>
        <p class="text-lg font-bold text-red-700 dark:text-red-300">${formatRupiah(pengeluaran)}</p>
      </div>
    </div>`;
}
