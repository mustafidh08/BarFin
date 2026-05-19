-- =================================================================================
-- SECURITY FIX: KeuanganSyariah.id
-- =================================================================================
-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- Script ini memperbaiki 2 masalah security advisor:
-- 1. Function search_path mutable (update_updated_at_column)
-- 2. Menambahkan DELETE policy yang hilang
-- =================================================================================

-- ── FIX 1: Function search_path mutable ────────────────────
-- Buat ulang fungsi dengan search_path yang di-pin ke ''
-- Semua referensi harus schema-qualified
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

-- ── FIX 2: Tambah DELETE policy (mencegah user menghapus data orang lain) ──
-- Drop dulu jika sudah ada
DROP POLICY IF EXISTS "Users can delete their own data" ON public.user_data;

CREATE POLICY "Users can delete their own data"
    ON public.user_data FOR DELETE
    USING (auth.uid() = user_id);

-- ── VERIFIKASI ─────────────────────────────────────────────
-- Jalankan query ini untuk memastikan RLS aktif:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
