// ============================================================
// goals.js — CRUD Goal Keuangan + Progress Tracking
// ============================================================

const GOAL_EMOJIS = ['🕌', '🌙', '⭐', '💰', '📚', '🏥', '🎓', '✈️', '🤲', '💍', '🏠', '🌱'];
const GOAL_KATEGORI = ['umroh', 'sedekah', 'darurat', 'pendidikan', 'lainnya'];

function openAddGoalModal() {
  openModal(`
    <div class="p-6">
      <h3 class="text-lg font-bold mb-5">Tambah Goal Baru</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Nama Goal</label>
        <input id="goal-nama" type="text" placeholder="Contoh: Dana Umroh 2025" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition" oninput="validateGoalForm()">
        <p id="err-goal-nama" class="text-xs text-red-500 mt-1 hidden">Nama goal tidak boleh kosong</p>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Pilih Ikon</label>
        <div class="grid grid-cols-6 gap-2" id="emoji-grid">
          ${GOAL_EMOJIS.map((e, i) => `<button type="button" onclick="selectEmoji('${e}')" class="emoji-btn p-2 text-xl rounded-xl border-2 ${i === 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600'} hover:border-emerald-400 transition text-center">${e}</button>`).join('')}
        </div>
        <input type="hidden" id="goal-ikon" value="🕌">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Target (Rp)</label>
        <input id="goal-target" type="text" placeholder="0" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono text-right" oninput="formatGoalInput(this); validateGoalForm()">
        <p id="err-goal-target" class="text-xs text-red-500 mt-1 hidden">Target harus lebih dari 0</p>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Sudah Terkumpul (Rp)</label>
        <input id="goal-terkumpul" type="text" placeholder="0" value="0" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono text-right" oninput="formatGoalInput(this)">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Kategori</label>
        <select id="goal-kategori" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition">
          ${GOAL_KATEGORI.map(k => `<option value="${k}">${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="mb-5">
        <label class="block text-sm font-medium mb-1.5">Deadline (opsional)</label>
        <input id="goal-deadline" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition">
      </div>
      <button id="btn-simpan-goal" onclick="simpanGoal()" class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50" disabled>Simpan Goal</button>
    </div>`, { maxWidth: 'max-w-md' });
}

function selectEmoji(emoji) {
  document.getElementById('goal-ikon').value = emoji;
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    if (btn.textContent.trim() === emoji) {
      btn.className = 'emoji-btn p-2 text-xl rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:border-emerald-400 transition text-center';
    } else {
      btn.className = 'emoji-btn p-2 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-400 transition text-center';
    }
  });
}

function formatGoalInput(el) {
  let raw = el.value.replace(/\D/g, '');
  if (raw) el.value = new Intl.NumberFormat('id-ID').format(parseInt(raw));
  else el.value = '';
}

function validateGoalForm() {
  const nama = (document.getElementById('goal-nama')?.value || '').trim();
  const targetRaw = (document.getElementById('goal-target')?.value || '').replace(/\D/g, '');
  let valid = true;

  const errN = document.getElementById('err-goal-nama');
  const errT = document.getElementById('err-goal-target');

  if (!nama) { errN?.classList.remove('hidden'); valid = false; } else { errN?.classList.add('hidden'); }
  if (!targetRaw || parseInt(targetRaw) <= 0) { errT?.classList.remove('hidden'); valid = false; } else { errT?.classList.add('hidden'); }

  const btn = document.getElementById('btn-simpan-goal');
  if (btn) btn.disabled = !valid;
  return valid;
}

function simpanGoal() {
  if (!validateGoalForm()) return;
  const data = getData();
  const terkumpulRaw = (document.getElementById('goal-terkumpul')?.value || '0').replace(/\D/g, '');
  const targetRaw = document.getElementById('goal-target').value.replace(/\D/g, '');
  const terkumpul = parseInt(terkumpulRaw) || 0;
  const target = parseInt(targetRaw);
  
  data.goals.push({
    id: generateId(),
    nama: sanitizeInput(document.getElementById('goal-nama').value.trim()),
    target: target,
    terkumpul: terkumpul,
    ikon: document.getElementById('goal-ikon').value,
    deadline: document.getElementById('goal-deadline').value ? document.getElementById('goal-deadline').value + 'T00:00:00' : null,
    kategori: document.getElementById('goal-kategori').value,
    selesai: terkumpul >= target
  });
  saveData(data);
  closeModal();
  showToast('Goal berhasil ditambahkan!', 'success');
  renderGoals();
}

function tambahDanaGoal(id) {
  openModal(`
    <div class="p-6">
      <h3 class="text-lg font-bold mb-4">Tambah Dana</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1.5">Nominal (Rp)</label>
        <input id="tambah-dana-amount" type="text" placeholder="0" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono text-right text-lg" oninput="formatGoalInput(this)" autofocus>
      </div>
      <button onclick="konfirmasiTambahDana('${id}')" class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">+ Tambah Dana</button>
    </div>`, { maxWidth: 'max-w-sm' });
}

function konfirmasiTambahDana(id) {
  const raw = (document.getElementById('tambah-dana-amount')?.value || '0').replace(/\D/g, '');
  const amount = parseInt(raw) || 0;
  if (amount <= 0) { showToast('Masukkan nominal yang valid', 'error'); return; }

  const data = getData();
  const goal = data.goals.find(g => g.id === id);
  if (goal) {
    goal.terkumpul += amount;
    if (goal.terkumpul >= goal.target) goal.selesai = true;
    saveData(data);
    closeModal();
    showToast(`${formatRupiah(amount)} ditambahkan ke "${goal.nama}"`, 'success');
    renderGoals();
  }
}

function hapusGoal(id) {
  openModal(`
    <div class="p-6 text-center">
      <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
      <h3 class="text-lg font-bold mb-2">Hapus Goal?</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Tindakan ini tidak bisa dibatalkan.</p>
      <div class="flex gap-3">
        <button onclick="closeModal()" class="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Batal</button>
        <button onclick="konfirmasiHapusGoal('${id}')" class="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Hapus</button>
      </div>
    </div>`, { maxWidth: 'max-w-sm' });
}

function konfirmasiHapusGoal(id) {
  const data = getData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveData(data);
  closeModal();
  showToast('Goal dihapus', 'info');
  renderGoals();
}

function renderGoals() {
  const container = document.getElementById('goals-grid');
  if (!container) return;
  const data = getData();

  if (data.goals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-20 h-20 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <p class="text-base mb-2">Belum ada goal keuangan</p>
        <p class="text-sm mb-4">Mulai menabung untuk tujuan islamimu</p>
        <button onclick="openAddGoalModal()" class="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition">+ Tambah Goal Pertama</button>
      </div>`;
    return;
  }

  container.innerHTML = data.goals.map(g => {
    const persen = Math.min(100, Math.round((g.terkumpul / g.target) * 100));
    const sisaHari = g.deadline ? Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;
    const isComplete = g.selesai || persen >= 100;

    // Confetti CSS
    const confettiHTML = isComplete ? `
      <div class="confetti-wrapper absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        ${Array(8).fill(0).map((_, i) => {
          const colors = ['#059669', '#D97706', '#0ea5e9', '#f43f5e', '#8b5cf6'];
          return `<div class="confetti-piece" style="left:${10 + i * 12}%;background:${colors[i % colors.length]};animation-delay:${i * 0.15}s"></div>`;
        }).join('')}
      </div>` : '';

    return `
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border ${isComplete ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-100 dark:border-gray-700'} card-hover overflow-hidden">
        ${confettiHTML}
        <div class="flex items-start justify-between mb-3 relative z-10">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${g.ikon}</span>
            <div>
              <h3 class="font-bold text-sm">${sanitizeInput(g.nama)}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">${g.kategori}</span>
            </div>
          </div>
          ${isComplete ? '<span class="text-lg">✅</span>' : `<button onclick="hapusGoal('${g.id}')" class="text-gray-400 hover:text-red-500 transition text-sm">🗑️</button>`}
        </div>
        <div class="relative z-10">
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-gray-500 dark:text-gray-400">${formatRupiah(g.terkumpul)} / ${formatRupiah(g.target)}</span>
            <span class="font-bold ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : ''}">${persen}%</span>
          </div>
          <div class="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full progress-bar-fill ${isComplete ? 'bg-emerald-500' : 'bg-emerald-600'}" style="width:${persen}%"></div>
          </div>
          <div class="flex items-center justify-between mt-3">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${isComplete ? '<span class="text-emerald-600 dark:text-emerald-400 font-semibold">Alhamdulillah! Tercapai ✅</span>' : (sisaHari !== null ? `${sisaHari} hari tersisa` : 'Tanpa deadline')}
            </p>
            ${!isComplete ? `<button onclick="tambahDanaGoal('${g.id}')" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition">+ Tambah</button>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}
