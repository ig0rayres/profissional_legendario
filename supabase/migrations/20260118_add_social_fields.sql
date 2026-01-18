-- Migration: Adicionar campos de redes sociais e slug ao profiles
-- Data: 2026-01-18

-- Adicionar campos se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Criar índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- Criar índice para busca por rota_number
CREATE INDEX IF NOT EXISTS idx_profiles_rota_number ON public.profiles(rota_number);

-- Comentários
COMMENT ON COLUMN public.profiles.whatsapp IS 'Número do WhatsApp com código de país';
COMMENT ON COLUMN public.profiles.instagram IS 'Handle do Instagram (sem @)';
COMMENT ON COLUMN public.profiles.slug IS 'URL amigável do perfil (gerado automaticamente do nome)';

-- Gerar slugs para perfis existentes que não têm
UPDATE public.profiles
SET slug = LOWER(
    REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(full_name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '--', '-'
    )
)
WHERE slug IS NULL AND full_name IS NOT NULL;
