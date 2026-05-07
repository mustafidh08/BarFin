-- =================================================================================
-- SCHEMA PANDUAN: KeuanganSyariah.id
-- =================================================================================
-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- Script ini akan membuat tabel yang dibutuhkan untuk sinkronisasi cloud
-- dan mengaktifkan Row Level Security (RLS) agar data aman per user.
-- =================================================================================

-- 1. Buat tabel user_data (menyimpan schema JSON dari LocalStorage)
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Aktifkan Row Level Security (RLS) pada tabel
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 3. Buat Policy agar user hanya bisa melihat datanya sendiri
CREATE POLICY "Users can view their own data"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Buat Policy agar user hanya bisa menambah/memperbarui datanya sendiri
CREATE POLICY "Users can insert their own data"
    ON public.user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Fungsi & Trigger untuk auto-update kolom updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_data_modtime ON public.user_data;

CREATE TRIGGER update_user_data_modtime
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
