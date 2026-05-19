-- =================================================================================
-- SCHEMA PANDUAN: KeuanganSyariah.id (Security-Hardened)
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

-- 3. RLS Policies — user hanya bisa akses datanya sendiri
CREATE POLICY "Users can view their own data"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
    ON public.user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
    ON public.user_data FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Fungsi & Trigger untuk auto-update kolom updated_at
-- SECURITY: search_path di-pin ke '' untuk mencegah search_path injection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_data_modtime ON public.user_data;

CREATE TRIGGER update_user_data_modtime
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
