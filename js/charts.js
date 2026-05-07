// ============================================================
// charts.js — Wrapper Chart.js untuk dashboard & investasi
// Chart.js di-load via CDN di halaman yang membutuhkan
// ============================================================

/**
 * Render grafik garis pemasukan vs pengeluaran 6 bulan terakhir
 * @param {string} canvasId - ID elemen canvas
 * @param {Object} data - Data dari getData()
 */
function renderChartPemasukanPengeluaran(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const now = new Date();
  const labels = [];
  const pemasukanData = [];
  const pengeluaranData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const bulan = d.toLocaleDateString('id-ID', { month: 'short' });
    labels.push(bulan);

    const transBulan = data.transaksi.filter(t => {
      const td = new Date(t.tanggal);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });

    pemasukanData.push(transBulan.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.jumlah, 0));
    pengeluaranData.push(transBulan.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.jumlah, 0));
  }

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  // Hancurkan chart lama jika ada
  if (window._chartPP) window._chartPP.destroy();

  window._chartPP = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: pemasukanData,
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Pengeluaran',
          data: pengeluaranData,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220,38,38,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor, usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans' } }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ctx.dataset.label + ': ' + formatRupiah(ctx.parsed.y);
            }
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } } },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans' },
            callback: v => formatRupiah(v)
          }
        }
      }
    }
  });
}

/**
 * Render grafik donut breakdown pengeluaran per kategori
 * @param {string} canvasId - ID elemen canvas
 * @param {Object} data - Data dari getData()
 */
function renderChartKategoriPengeluaran(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const { bulan, tahun } = getBulanIni();

  const pengeluaranBulanIni = data.transaksi.filter(t => {
    const d = new Date(t.tanggal);
    return t.tipe === 'pengeluaran' && d.getMonth() === bulan && d.getFullYear() === tahun;
  });

  const kategoriMap = {};
  pengeluaranBulanIni.forEach(t => {
    kategoriMap[t.kategori] = (kategoriMap[t.kategori] || 0) + t.jumlah;
  });

  const labels = Object.keys(kategoriMap);
  const values = Object.values(kategoriMap);
  const colors = ['#059669', '#0ea5e9', '#D97706', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  if (window._chartKP) window._chartKP.destroy();

  if (labels.length === 0) {
    canvas.parentElement.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <svg class="w-16 h-16 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/></svg>
        <p class="text-sm">Belum ada pengeluaran bulan ini</p>
      </div>`;
    return;
  }

  window._chartKP = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: isDark ? '#1f2937' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, usePointStyle: true, padding: 12, font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const persen = ((ctx.parsed / total) * 100).toFixed(1);
              return ctx.label + ': ' + formatRupiah(ctx.parsed) + ' (' + persen + '%)';
            }
          }
        }
      }
    }
  });
}

/**
 * Render simulasi investasi — 3 skenario return
 * @param {string} canvasId - ID elemen canvas
 * @param {number} modal - Modal investasi awal
 * @param {number} tahun - Durasi investasi dalam tahun
 */
function renderChartSimulasi(canvasId, modal, tahun) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const labels = [];
  const skenarioRendah = [];
  const skenarioModerat = [];
  const skenarioTinggi = [];

  const returnRendah = 0.05;
  const returnModerat = 0.10;
  const returnTinggi = 0.18;

  for (let i = 0; i <= tahun; i++) {
    labels.push('Tahun ' + i);
    skenarioRendah.push(Math.round(modal * Math.pow(1 + returnRendah, i)));
    skenarioModerat.push(Math.round(modal * Math.pow(1 + returnModerat, i)));
    skenarioTinggi.push(Math.round(modal * Math.pow(1 + returnTinggi, i)));
  }

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  if (window._chartSim) window._chartSim.destroy();

  window._chartSim = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Konservatif (5%)',
          data: skenarioRendah,
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.05)',
          fill: true, tension: 0.3, pointRadius: 2
        },
        {
          label: 'Moderat (10%)',
          data: skenarioModerat,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14,165,233,0.05)',
          fill: true, tension: 0.3, pointRadius: 2
        },
        {
          label: 'Agresif (18%)',
          data: skenarioTinggi,
          borderColor: '#D97706',
          backgroundColor: 'rgba(217,119,6,0.05)',
          fill: true, tension: 0.3, pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: textColor, usePointStyle: true, padding: 16, font: { family: 'Plus Jakarta Sans' } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatRupiah(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' }, maxTicksLimit: 10 } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' }, callback: v => formatRupiah(v) } }
      }
    }
  });
}
