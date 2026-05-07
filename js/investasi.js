// ============================================================
// investasi.js — Quiz profil risiko, scoring, rekomendasi
// ============================================================

const QUIZ_QUESTIONS = [
  { id:1, bobot:20, pertanyaan:"Berapa usia kamu saat ini?", konteks:"Usia mempengaruhi kemampuan recovery jika investasi rugi", pilihan:[{teks:"Di bawah 25 tahun",skor:3},{teks:"25–35 tahun",skor:3},{teks:"36–45 tahun",skor:2},{teks:"Di atas 45 tahun",skor:1}]},
  { id:2, bobot:25, pertanyaan:"Apa tujuan utama investasimu?", konteks:"Tujuan berbeda membutuhkan strategi yang berbeda", pilihan:[{teks:"Melindungi modal dari inflasi",skor:1},{teks:"Menumbuhkan tabungan secara stabil",skor:2},{teks:"Mencapai pertumbuhan jangka panjang",skor:3},{teks:"Mendapat keuntungan maksimal",skor:3}]},
  { id:3, bobot:20, pertanyaan:"Berapa lama kamu berencana berinvestasi?", konteks:"Horizon waktu menentukan toleransi risiko yang wajar", pilihan:[{teks:"Kurang dari 1 tahun",skor:1},{teks:"1–3 tahun",skor:2},{teks:"3–5 tahun",skor:2},{teks:"Lebih dari 5 tahun",skor:3}]},
  { id:4, bobot:30, pertanyaan:"Investasimu turun 20% dalam sebulan. Reaksimu?", konteks:"Mengukur toleransi emosional terhadap volatilitas", pilihan:[{teks:"Panik dan tarik semua dana segera",skor:1},{teks:"Khawatir, tapi menunggu sambil memantau",skor:2},{teks:"Tenang, ini risiko yang sudah aku antisipasi",skor:3},{teks:"Justru menambah investasi karena harga turun",skor:3}]},
  { id:5, bobot:15, pertanyaan:"Berapa persen penghasilan yang siap diinvestasikan?", konteks:"Dana investasi tidak boleh dari dana kebutuhan pokok", pilihan:[{teks:"Kurang dari 5%",skor:1},{teks:"5–15%",skor:2},{teks:"15–30%",skor:3},{teks:"Lebih dari 30%",skor:3}]},
  { id:6, bobot:20, pertanyaan:"Seberapa paham kamu tentang instrumen investasi?", konteks:"Pengetahuan mempengaruhi kemampuan mengelola risiko", pilihan:[{teks:"Belum paham sama sekali",skor:1},{teks:"Sedikit paham dari baca-baca",skor:2},{teks:"Cukup paham, pernah investasi sebelumnya",skor:2},{teks:"Sangat paham, aktif memantau portofolio",skor:3}]},
  { id:7, bobot:15, pertanyaan:"Apakah kamu punya dana darurat yang cukup (3–6 bulan)?", konteks:"Dana darurat wajib ada sebelum berinvestasi (maslahah)", pilihan:[{teks:"Belum ada sama sekali",skor:1},{teks:"Ada tapi masih kurang",skor:2},{teks:"Sudah cukup 3 bulan",skor:2},{teks:"Sudah cukup 6 bulan +",skor:3}]}
];

const REKOMENDASI = {
  konservatif: {
    filosofi: "Utamakan keamanan modal, pertumbuhan moderat",
    instrumen: [
      { nama:"Deposito Bank Syariah", ikon:"🏦", return_estimasi:"3–5% per tahun", risiko:"Sangat Rendah", minimum:"Rp 1.000.000", keunggulan:["Dijamin LPS hingga Rp 2 miliar","Akad mudharabah, bagi hasil bukan bunga","Cocok untuk dana darurat tambahan"], contoh:["Bank Syariah Indonesia (BSI)","Bank Muamalat","BCA Syariah"], label_syariah:"halal", catatan_syariah:"Akad mudharabah — keuntungan berupa bagi hasil nisbah yang disepakati, bukan bunga tetap (riba)." },
      { nama:"Reksa Dana Pasar Uang Syariah", ikon:"💼", return_estimasi:"4–6% per tahun", risiko:"Rendah", minimum:"Rp 10.000", keunggulan:["Likuiditas tinggi, cair T+1","Dikelola manajer investasi profesional","Portofolio instrumen pasar uang syariah"], contoh:["Mandiri Investa Pasar Uang Syariah","Manulife Syariah Pasar Uang"], label_syariah:"halal", catatan_syariah:"Diawasi Dewan Pengawas Syariah (DPS). Portofolio hanya berisi instrumen bebas riba." },
      { nama:"Sukuk Ritel Pemerintah (SR/ST)", ikon:"📜", return_estimasi:"5–7% per tahun", risiko:"Rendah", minimum:"Rp 1.000.000", keunggulan:["Diterbitkan dan dijamin pemerintah Indonesia","Imbalan dibayar setiap bulan","Bisa dibeli di Bibit, Bareksa, BRI Danareksa"], contoh:["SR (Sukuk Ritel)","ST (Sukuk Tabungan)"], label_syariah:"halal", catatan_syariah:"Akad wakalah — pemerintah sebagai wakil mengelola dana untuk proyek infrastruktur negara." }
    ]
  },
  moderat: {
    filosofi: "Seimbang antara pertumbuhan dan keamanan",
    instrumen: [
      { nama:"Reksa Dana Campuran Syariah", ikon:"⚖️", return_estimasi:"7–12% per tahun", risiko:"Menengah", minimum:"Rp 10.000", keunggulan:["Mix saham + sukuk, risiko lebih terkontrol","Dikelola manajer investasi berpengalaman","Cocok untuk tujuan 3–5 tahun"], contoh:["Manulife Syariah Sektoral Amanah","BNI-AM Dana Syariah"], label_syariah:"halal", catatan_syariah:"Portofolio melalui screening syariah DPS. Bebas dari saham sektor haram." },
      { nama:"Reksa Dana Indeks Saham Syariah", ikon:"📊", return_estimasi:"10–15% per tahun", risiko:"Menengah–Tinggi", minimum:"Rp 10.000", keunggulan:["Mengikuti indeks JII atau ISSI","Expense ratio lebih rendah dari aktif","Diversifikasi otomatis"], contoh:["Reksa Dana Indeks ISSI","JII Index Fund"], label_syariah:"halal", catatan_syariah:"Berbasis Jakarta Islamic Index (JII) — 30 saham paling likuid yang diseleksi sesuai syariah." },
      { nama:"Saham Syariah (JII / ISSI)", ikon:"📈", return_estimasi:"Variabel, potensi 15%+", risiko:"Menengah–Tinggi", minimum:"Rp 50.000", keunggulan:["Potensi dividen + capital gain","Kepemilikan nyata di perusahaan","Likuiditas tinggi"], contoh:["TLKM","BBRI","SIDO","ICBP"], label_syariah:"halal", catatan_syariah:"Hanya beli saham di Daftar Efek Syariah (DES) OJK. Cek idx.co.id sebelum membeli." }
    ]
  },
  agresif: {
    filosofi: "Maksimalkan pertumbuhan jangka panjang",
    instrumen: [
      { nama:"Saham Syariah Growth", ikon:"🚀", return_estimasi:"15–25%+ per tahun", risiko:"Tinggi", minimum:"Rp 50.000", keunggulan:["Potensi keuntungan tertinggi jangka panjang","Pilih sektor yang sedang berkembang","Cocok untuk horizon 5+ tahun"], contoh:["Sektor teknologi & infrastruktur syariah"], label_syariah:"halal", catatan_syariah:"Lakukan analisis fundamental sebelum beli. Hindari trading spekulatif jangka pendek (mendekati maysir)." },
      { nama:"Sukuk Korporasi", ikon:"🏢", return_estimasi:"7–10% per tahun", risiko:"Menengah", minimum:"Rp 1.000.000", keunggulan:["Return lebih tinggi dari sukuk pemerintah","Diversifikasi dari saham"], contoh:["Sukuk Telkom","Sukuk PLN"], label_syariah:"halal", catatan_syariah:"Pastikan perusahaan penerbit tidak bergerak di sektor haram." },
      { nama:"Emas (Logam Mulia)", ikon:"🥇", return_estimasi:"5–10% per tahun", risiko:"Menengah", minimum:"Rp 50.000", keunggulan:["Lindung nilai terhadap inflasi","Aset nyata (tangible)","Diversifikasi solid"], contoh:["Tabungan Emas Pegadaian","Logam Mulia Antam"], label_syariah:"halal", catatan_syariah:"Beli emas tunai (spot), bukan kontrak berjangka." },
      { nama:"Aset Kripto", ikon:"⚠️", return_estimasi:"Sangat volatil", risiko:"Sangat Tinggi", minimum:"Variatif", keunggulan:["Potensi pertumbuhan tinggi"], contoh:["Status syariah masih diperdebatkan ulama"], label_syariah:"syubhat", catatan_syariah:"⚠️ STATUS: SYUBHAT. Fatwa MUI No.13/2021 mengharamkan kripto sebagai mata uang karena mengandung gharar, dharar, dan qimar. Konsultasikan dengan ulama sebelum berinvestasi." }
    ]
  }
};

let quizCurrentQ = 0;
let quizAnswers = [];

function startQuiz() {
  quizCurrentQ = 0;
  quizAnswers = [];
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  const q = QUIZ_QUESTIONS[quizCurrentQ];
  const progress = ((quizCurrentQ) / QUIZ_QUESTIONS.length * 100).toFixed(0);

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 fade-in max-w-2xl mx-auto">
      <div class="mb-6">
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span>Pertanyaan ${quizCurrentQ+1}/${QUIZ_QUESTIONS.length}</span><span>${progress}%</span></div>
        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"><div class="h-full bg-emerald-600 rounded-full transition-all duration-500" style="width:${progress}%"></div></div>
      </div>
      <h3 class="text-lg md:text-xl font-bold mb-2">${q.pertanyaan}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${q.konteks}</p>
      <div class="space-y-3">
        ${q.pilihan.map((p, i) => `
          <button onclick="answerQuiz(${i})" class="quiz-option w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-medium hover:border-emerald-500 transition">
            ${p.teks}
          </button>`).join('')}
      </div>
      ${quizCurrentQ > 0 ? `<button onclick="prevQuiz()" class="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Kembali</button>` : ''}
    </div>`;
}

function answerQuiz(idx) {
  const q = QUIZ_QUESTIONS[quizCurrentQ];
  const p = q.pilihan[idx];
  quizAnswers[quizCurrentQ] = { pertanyaan_id: q.id, skor: p.skor, teks_jawaban: p.teks };

  // Highlight selected
  const btns = document.querySelectorAll('.quiz-option');
  btns.forEach((b, i) => {
    if (i === idx) b.classList.add('selected');
    else b.classList.remove('selected');
  });

  setTimeout(() => {
    quizCurrentQ++;
    if (quizCurrentQ < QUIZ_QUESTIONS.length) {
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 400);
}

function prevQuiz() {
  if (quizCurrentQ > 0) { quizCurrentQ--; renderQuizQuestion(); }
}

function finishQuiz() {
  const container = document.getElementById('quiz-container');
  // Loading animation
  container.innerHTML = `
    <div class="text-center py-20 fade-in">
      <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
      <p class="text-lg font-semibold">Menganalisis profilmu...</p>
    </div>`;

  setTimeout(() => {
    // Hitung skor
    let skorRaw = 0;
    const skorMax = QUIZ_QUESTIONS.reduce((s, q) => s + 3 * q.bobot, 0); // 435
    quizAnswers.forEach((a, i) => { skorRaw += a.skor * QUIZ_QUESTIONS[i].bobot; });
    const persentase = Math.round((skorRaw / skorMax) * 100);
    let hasil = 'konservatif';
    if (persentase > 70) hasil = 'agresif';
    else if (persentase >= 45) hasil = 'moderat';

    const now = new Date();
    const reassessment = new Date(now);
    reassessment.setMonth(reassessment.getMonth() + 6);

    const data = getData();
    data.risk_profile = {
      sudah_isi_quiz: true,
      hasil,
      skor_total: persentase,
      jawaban: quizAnswers,
      tanggal_assessment: now.toISOString(),
      tanggal_reassessment: reassessment.toISOString()
    };
    saveData(data);
    renderHasilProfil(hasil, persentase);
  }, 1500);
}

function renderHasilProfil(hasil, skor) {
  const container = document.getElementById('quiz-container');
  const config = {
    konservatif: { color:'emerald', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800/40', icon:'🛡️', desc:'Kamu memprioritaskan keamanan modal. Sesuai prinsip kehati-hatian (ihtiyath) — sejalan dengan larangan gharar dalam Islam.' },
    moderat: { color:'blue', bg:'bg-blue-50 dark:bg-blue-900/20', border:'border-blue-200 dark:border-blue-800/40', icon:'⚖️', desc:'Menyeimbangkan keamanan dan pertumbuhan. Selaras dengan prinsip wasathiyah (jalan tengah) dalam Islam.' },
    agresif: { color:'amber', bg:'bg-amber-50 dark:bg-amber-900/20', border:'border-amber-200 dark:border-amber-800/40', icon:'🚀', desc:'Siap menghadapi volatilitas demi pertumbuhan. Tetap pastikan semua instrumen bebas gharar, maysir, dan riba.' }
  };
  const c = config[hasil];

  container.innerHTML = `
    <div class="${c.bg} ${c.border} border rounded-2xl p-6 md:p-8 max-w-2xl mx-auto fade-in mb-8">
      <div class="text-center mb-6">
        <span class="text-5xl mb-3 block">${c.icon}</span>
        <span class="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-${c.color}-100 dark:bg-${c.color}-900/40 text-${c.color}-700 dark:text-${c.color}-300 uppercase tracking-wider mb-3">Profil: ${hasil}</span>
        <div class="w-full max-w-xs mx-auto mt-4">
          <div class="flex justify-between text-xs mb-1"><span>Skor</span><span class="font-bold">${skor}/100</span></div>
          <div class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full"><div class="h-full bg-${c.color}-500 rounded-full progress-bar-fill" style="width:${skor}%"></div></div>
        </div>
      </div>
      <p class="text-sm text-center text-gray-700 dark:text-gray-300 mb-6">${c.desc}</p>
      <div class="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
        ⚠️ Ini bukan saran investasi profesional. Hasil quiz bersifat edukatif. Konsultasikan dengan perencana keuangan syariah bersertifikat sebelum mengambil keputusan investasi.
      </div>
      <a href="#rekomendasi" class="block text-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Lihat Rekomendasi ↓</a>
    </div>`;

  renderRekomendasi(hasil);
}

function renderRekomendasi(profil) {
  const container = document.getElementById('rekomendasi-container');
  if (!container) return;
  const rek = REKOMENDASI[profil];
  if (!rek) return;

  container.innerHTML = `
    <div id="rekomendasi" class="fade-in">
      <h2 class="text-xl font-bold mb-2">Rekomendasi Investasi Syariah</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${rek.filosofi}</p>
      <div class="space-y-4">
        ${rek.instrumen.map(inst => {
          const labelClass = inst.label_syariah === 'halal' ? 'label-halal' : 'label-syubhat';
          const risikoColor = inst.risiko.includes('Rendah') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : inst.risiko.includes('Tinggi') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
          const isCrypto = inst.label_syariah === 'syubhat';
          return `
            ${isCrypto ? '<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 mb-2">⚠️ Perhatian: Instrumen berikut berstatus syubhat (diperdebatkan). Baca catatan syariah sebelum mempertimbangkan.</div>' : ''}
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">${inst.ikon}</span>
                  <div>
                    <h3 class="font-bold text-sm">${inst.nama}</h3>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${labelClass} font-medium">${inst.label_syariah}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 font-medium">📈 ${inst.return_estimasi}</span>
                <span class="text-xs px-2 py-1 rounded-lg ${risikoColor} font-medium">${inst.risiko}</span>
                <span class="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 font-medium">Min: ${inst.minimum}</span>
              </div>
              <ul class="space-y-1 mb-3">
                ${inst.keunggulan.map(k => `<li class="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5"><span class="text-emerald-500 mt-0.5">✓</span>${k}</li>`).join('')}
              </ul>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Contoh:</strong> ${inst.contoh.join(', ')}</p>
              <details class="group">
                <summary class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">📖 Catatan Syariah</summary>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-2 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800">${inst.catatan_syariah}</p>
              </details>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderInvestasiPage() {
  const data = getData();
  const quizContainer = document.getElementById('quiz-container');
  const rekContainer = document.getElementById('rekomendasi-container');
  const profilSidebar = document.getElementById('profil-sidebar');

  if (!data.risk_profile.sudah_isi_quiz) {
    // Tampilkan intro quiz
    quizContainer.innerHTML = `
      <div class="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 md:p-8 text-white max-w-2xl mx-auto mb-8 fade-in">
        <h2 class="text-xl md:text-2xl font-bold mb-3">📋 Kenali Profil Risikomu</h2>
        <p class="text-sm text-emerald-100 mb-4">Dalam Islam, setiap keputusan finansial harus dilakukan dengan kehati-hatian (ihtiyath) dan menghindari spekulasi (gharar). Quiz ini membantu menemukan investasi syariah yang paling sesuai kondisi dan kemampuanmu.</p>
        <div class="bg-emerald-700/50 rounded-xl p-4 mb-5">
          <p class="font-amiri text-lg text-emerald-100 text-right mb-2" dir="rtl">يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱتَّقُواْ ٱللَّهَ وَلۡتَنظُرۡ نَفۡسٞ مَّا قَدَّمَتۡ لِغَدٖ</p>
          <p class="text-xs text-emerald-200 italic">"Hai orang-orang yang beriman, bertakwalah kepada Allah dan hendaklah setiap diri memperhatikan apa yang telah diperbuatnya untuk hari esok." — QS. Al-Hasyr: 18</p>
        </div>
        <div class="flex items-center gap-4">
          <button onclick="startQuiz()" class="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition">Mulai Quiz</button>
          <span class="text-sm text-emerald-200">⏱ Hanya 5 menit</span>
        </div>
      </div>`;
    rekContainer.innerHTML = '';
  } else {
    renderHasilProfil(data.risk_profile.hasil, data.risk_profile.skor_total);
  }

  // Profil sidebar
  if (profilSidebar && data.risk_profile.sudah_isi_quiz) {
    const icons = { konservatif:'🛡️', moderat:'⚖️', agresif:'🚀' };
    profilSidebar.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">${icons[data.risk_profile.hasil]}</span>
          <span class="font-bold text-sm">Profil: ${data.risk_profile.hasil.charAt(0).toUpperCase() + data.risk_profile.hasil.slice(1)}</span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Dinilai: ${formatTanggal(data.risk_profile.tanggal_assessment)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Reassessment: ${formatTanggal(data.risk_profile.tanggal_reassessment)}</p>
        <button onclick="resetQuiz()" class="w-full py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">Perbarui Profil</button>
      </div>`;
  }
}

function resetQuiz() {
  const data = getData();
  data.risk_profile = { sudah_isi_quiz:false, hasil:null, skor_total:0, jawaban:[], tanggal_assessment:null, tanggal_reassessment:null };
  saveData(data);
  renderInvestasiPage();
}
