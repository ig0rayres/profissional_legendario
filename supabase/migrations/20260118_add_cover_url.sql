-- ============================================
-- ADICIONAR CAMPO COVER_URL NA TABELA PROFILES
-- Execute no Supabase SQL Editor
-- ============================================

-- Adicionar coluna cover_url se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_url text;

-- Comentário da coluna
COMMENT ON COLUMN public.profiles.cover_url IS 'URL da foto de capa do perfil do usuário';

-- Verificar se foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'cover_url';
