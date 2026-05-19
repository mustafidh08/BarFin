// ============================================================
// supabase-client.js — Wrapper Supabase UMD Client (Hardened)
// ============================================================

// Supabase Config — Anon Key is safe to expose (RLS protects data)
const SUPABASE_URL = 'https://xdghpmxvgbvdtmnamofe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZ2hwbXh2Z2J2ZHRtbmFtb2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjcxOTMsImV4cCI6MjA5MzY0MzE5M30.rv9toqhPIHq8sD80UIRDKWYh9-lb9avEs9vXJN9aW9E';

let supabaseClient = null;

// Pastikan Supabase script sudah di-load di HTML sebelum memanggil ini
function initSupabase() {
  if (typeof supabase !== 'undefined' && !supabaseClient) {
    if (SUPABASE_URL.includes('GANTI_DENGAN')) {
      console.warn('Supabase URL/Key belum dikonfigurasi.');
      return false;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    return true;
  }
  return !!supabaseClient;
}

// Cek apakah user saat ini sedang login
async function getSupabaseUser() {
  if (!initSupabase()) return null;
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
    return session ? session.user : null;
  } catch (err) {
    console.error('getSupabaseUser exception:', err.message);
    return null;
  }
}

// Fungsi Login menggunakan Google OAuth
async function signInWithGoogle() {
  if (!initSupabase()) {
    showToast('Konfigurasi cloud belum diatur', 'error');
    return;
  }
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href
    }
  });
  if (error) {
    console.error('Google Sign-In Error:', error.message);
    showToast('Gagal login. Silakan coba lagi.', 'error');
  }
}

// Fungsi Logout
async function signOutSupabase() {
  if (!initSupabase()) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Sign Out Error:', error.message);
    showToast('Gagal logout. Silakan coba lagi.', 'error');
  } else {
    showToast('Berhasil logout', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// Ambil data dari cloud
async function fetchFromCloud() {
  if (!initSupabase()) return null;
  const user = await getSupabaseUser();
  if (!user) return null;

  try {
    const { data, error } = await supabaseClient
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found (belum ada data)
      console.error('Fetch cloud data error:', error.message);
      return null;
    }

    // Security: Validasi bahwa data yang diterima adalah object
    if (data && data.data && typeof data.data === 'object') {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error('fetchFromCloud exception:', err.message);
    return null;
  }
}

// Simpan data ke cloud
async function syncToCloud(appData) {
  if (!initSupabase()) return false;
  const user = await getSupabaseUser();
  if (!user) return false; // Jangan sync jika belum login

  try {
    // Security: Hindari menyimpan cache dan data sensitif ke cloud
    const cloudData = { ...appData };
    delete cloudData.harga_cache;

    // Security: Validasi ukuran data sebelum upload (max 1MB)
    const dataSize = new Blob([JSON.stringify(cloudData)]).size;
    if (dataSize > 1024 * 1024) {
      console.warn('Data terlalu besar untuk sync:', dataSize, 'bytes');
      return false;
    }

    const { error } = await supabaseClient
      .from('user_data')
      .upsert({ user_id: user.id, data: cloudData }, { onConflict: 'user_id' });

    if (error) {
      console.error('Sync to cloud error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('syncToCloud exception:', err.message);
    return false;
  }
}
