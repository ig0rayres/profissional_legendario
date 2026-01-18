-- Migration: Adicionar campos faltantes ao profiles
-- Data: 2026-01-18

-- Adicionar campos básicos se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pista_id UUID REFERENCES public.pistas(id);

-- Comentários
COMMENT ON COLUMN public.profiles.bio IS 'Biografia do usuário';
COMMENT ON COLUMN public.profiles.city IS 'Cidade do usuário';
COMMENT ON COLUMN public.profiles.state IS 'Estado do usuário';
COMMENT ON COLUMN public.profiles.pista_id IS 'Referência para a pista/localização';
