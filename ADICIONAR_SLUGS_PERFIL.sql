-- =============================================
-- ADICIONAR SLUGS PARA URLs AMIGÁVEIS
-- =============================================

-- 1. Adicionar coluna slug
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

COMMENT ON COLUMN public.profiles.slug IS 'URL amigável do perfil (ex: usuario-elite)';

-- 2. Function para gerar slug a partir do nome
CREATE OR REPLACE FUNCTION public.generate_slug(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_slug TEXT;
BEGIN
    -- Converter para lowercase, remover acentos, trocar espaços por hífen
    v_slug := lower(p_name);
    v_slug := translate(v_slug, 
        'áàâãäåèéêëìíîïòóôõöùúûüýÿçñÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÇÑ',
        'aaaaaaeeeeiiiioooouuuuyycnaaaaaaeeeeiiiioooouuuuyycn'
    );
    v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
    v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
    
    RETURN v_slug;
END;
$$;

-- 3. Gerar slugs para usuários existentes
UPDATE public.profiles
SET slug = generate_slug(full_name) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- 4. Garantir que todos tenham slug
SELECT 
    id,
    full_name,
    slug,
    CASE 
        WHEN slug IS NULL THEN '❌ SEM SLUG'
        ELSE '✅ TEM SLUG'
    END as status
FROM public.profiles;

-- 5. Function para garantir slug único ao criar usuário
CREATE OR REPLACE FUNCTION public.ensure_unique_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_slug TEXT;
    v_final_slug TEXT;
    v_counter INTEGER := 1;
BEGIN
    -- Se já tem slug, não faz nada
    IF NEW.slug IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Gerar slug base
    v_base_slug := generate_slug(NEW.full_name);
    v_final_slug := v_base_slug;
    
    -- Garantir unicidade
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = v_final_slug AND id != NEW.id) LOOP
        v_final_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    NEW.slug := v_final_slug;
    RETURN NEW;
END;
$$;

-- 6. Criar trigger para gerar slug automaticamente
DROP TRIGGER IF EXISTS ensure_slug_on_insert ON public.profiles;
CREATE TRIGGER ensure_slug_on_insert
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_slug();

-- 7. Ver URLs amigáveis dos usuários de teste
SELECT 
    id,
    full_name,
    slug,
    '/professional/' || slug as url_amigavel,
    '/professional/' || id as url_antiga
FROM public.profiles
WHERE email LIKE '%rotabusiness.com.br%'
ORDER BY email;

-- 8. Verificação final
SELECT 
    COUNT(*) as total_profiles,
    COUNT(slug) as profiles_com_slug,
    COUNT(DISTINCT slug) as slugs_unicos
FROM public.profiles;
