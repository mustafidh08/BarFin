// ============================================================
// zakat.js — Kalkulator Zakat Maal & Penghasilan + Riwayat
// ============================================================

function hitungZakatMaal() {
  const fields = ['tunai', 'emas', 'investasi', 'piutang', 'dagangan', 'hutang'];
  const values = {};
  let valid = true;

  fields.forEach(f => {
    const el = document.getElementById('zakat-' + f);
    const raw = el ? el.value.replace(/\D/g, '') : '0';
    values[f] = parseInt(raw) || 0;
  });

  const totalAset = values.tunai + values.emas + values.investasi + values.piutang + values.dagangan;
  const totalBersih = totalAset - values.hutang;
  const data = getData();
  const hargaEmas = data.user.nisab_harga_emas_per_gram;
  const nishab = 85 * hargaEmas;

  const resultEl = document.getElementById('hasil-zakat-maal');
  const wajib = totalBersih >= nishab;
  const jumlahZakat = wajib ? totalBersih * 0.025 : 0;

  resultEl.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border ${wajib ? 'border-emerald-200 dark:border-emerald-800/40' : 'border-gray-200 dark:border-gray-700'} shadow-sm fade-in">
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Harta</p><p class="font-bold text-lg">${formatRupiah(totalAset)}</p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Hutang</p><p class="font-bold text-lg text-red-500">-${formatRupiah(values.hutang)}</p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Harta Bersih</p><p class="font-bold text-lg">${formatRupiah(totalBersih)}</p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Nishab</p><p class="font-bold text-lg">${formatRupiah(nishab)}</p><p class="text-[10px] text-gray-400">85g × ${formatRupiah(hargaEmas)}</p></div>
      </div>
      <div class="p-4 rounded-xl ${wajib ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'} mb-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg">${wajib ? '✅' : 'ℹ️'}</span>
          <p class="font-bold ${wajib ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}">${wajib ? 'Wajib Zakat' : 'Belum Wajib Zakat'}</p>
        </div>
        ${wajib
          ? `<p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">Zakat: ${formatRupiah(jumlahZakat)}</p><p class="text-xs text-gray-500 mt-1">2.5% × ${formatRupiah(totalBersih)}</p>`
          : `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Harta bersih belum mencapai nishab (${formatRupiah(nishab)})</p>`}
      </div>
      ${wajib ? `
        <button onclick="simpanZakat('maal', ${totalBersih}, ${jumlahZakat})" class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">📋 Simpan & Tandai Sudah Dihitung</button>
      ` : ''}
    </div>`;
}

function hitungZakatPenghasilan() {
  const data = getData();
  const transBulanIni = getTransaksiBulanIni(data);
  const penghasilan = getTotalPemasukan(transBulanIni);
  const hargaEmas = data.user.nisab_harga_emas_per_gram;
  const nishabBulanan = Math.round((85 * hargaEmas) / 12);
  const wajib = penghasilan >= nishabBulanan;
  const jumlahZakat = wajib ? penghasilan * 0.025 : 0;

  const resultEl = document.getElementById('hasil-zakat-penghasilan');
  resultEl.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border ${wajib ? 'border-emerald-200 dark:border-emerald-800/40' : 'border-gray-200 dark:border-gray-700'} shadow-sm fade-in">
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Penghasilan Bulan Ini</p><p class="font-bold text-lg">${formatRupiah(penghasilan)}</p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Nishab Bulanan</p><p class="font-bold text-lg">${formatRupiah(nishabBulanan)}</p><p class="text-[10px] text-gray-400">(85g × ${formatRupiah(hargaEmas)}) / 12</p></div>
      </div>
      <div class="p-4 rounded-xl ${wajib ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'} mb-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg">${wajib ? '✅' : 'ℹ️'}</span>
          <p class="font-bold ${wajib ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}">${wajib ? 'Wajib Zakat Penghasilan' : 'Belum Wajib Zakat'}</p>
        </div>
        ${wajib
          ? `<p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">Zakat: ${formatRupiah(jumlahZakat)}</p><p class="text-xs text-gray-500 mt-1">2.5% × ${formatRupiah(penghasilan)}</p>`
          : `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Penghasilan belum mencapai nishab bulanan</p>`}
      </div>
      ${wajib ? `<button onclick="simpanZakat('penghasilan', ${penghasilan}, ${jumlahZakat})" class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">📋 Simpan & Tandai Sudah Dihitung</button>` : ''}
    </div>`;
}

function simpanZakat(tipe, totalHarta, jumlahZakat) {
  const data = getData();
  data.zakat_history.push({
    id: generateId(),
    tipe,
    total_harta: totalHarta,
    jumlah_zakat: jumlahZakat,
    sudah_dibayar: false,
    tanggal_hitung: new Date().toISOString()
  });
  saveData(data);
  showToast('Perhitungan zakat tersimpan!', 'success');
  renderRiwayatZakat();
}

function toggleBayarZakat(id) {
  const data = getData();
  const z = data.zakat_history.find(x => x.id === id);
  if (z) {
    z.sudah_dibayar = !z.sudah_dibayar;
    saveData(data);
    showToast(z.sudah_dibayar ? 'Alhamdulillah, zakat ditandai sudah dibayar' : 'Status pembayaran diubah', 'info');
    renderRiwayatZakat();
  }
}

function renderRiwayatZakat() {
  const el = document.getElementById('riwayat-zakat');
  if (!el) return;
  const data = getData();
  const history = [...data.zakat_history].sort((a, b) => new Date(b.tanggal_hitung) - new Date(a.tanggal_hitung));

  if (history.length === 0) {
    el.innerHTML = '<p class="text-center text-sm text-gray-400 dark:text-gray-500 py-8">Belum ada riwayat perhitungan zakat</p>';
    return;
  }

  el.innerHTML = history.map(z => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg ${z.sudah_dibayar ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}">
        ${z.sudah_dibayar ? '✅' : '⏳'}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold">Zakat ${z.tipe === 'maal' ? 'Maal' : 'Penghasilan'}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">${formatTanggal(z.tanggal_hitung)}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">${formatRupiah(z.jumlah_zakat)}</p>
        <button onclick="toggleBayarZakat('${z.id}')" class="text-[10px] px-2 py-0.5 rounded-full font-medium ${z.sudah_dibayar ? 'label-halal' : 'label-syubhat'} cursor-pointer hover:opacity-80">
          ${z.sudah_dibayar ? 'Sudah Dibayar' : 'Belum Dibayar'}
        </button>
      </div>
    </div>`).join('');
}

function formatZakatInput(el) {
  let raw = el.value.replace(/\D/g, '');
  if (raw) el.value = new Intl.NumberFormat('id-ID').format(parseInt(raw));
  else el.value = '';
}
