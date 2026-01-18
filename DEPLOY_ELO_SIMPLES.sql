-- =============================================
-- ELO DA ROTA - ESTRUTURA SIMPLES E FUNCIONAL
-- Usa APENAS estruturas que já existem no banco
-- Data: 17/01/2026
-- =============================================

-- =============================================
-- 1. TABELA PORTFOLIO
-- =============================================
CREATE TABLE IF NOT

 EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.portfolio_items(user_id);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Portfolio público" ON public.portfolio_items;
CREATE POLICY "Portfolio público" ON public.portfolio_items FOR SELECT USING (true);

-- =============================================
-- 2. SLUGS (URLs Amigáveis)
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- Function para gerar slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(p_name TEXT, p_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_slug TEXT;
    v_counter INTEGER := 1;
BEGIN
    v_slug := lower(trim(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')));
    v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
    
    WHILE EXISTS(SELECT 1 FROM profiles WHERE slug = v_slug AND (p_user_id IS NULL OR id != p_user_id)) LOOP
        v_slug := regexp_replace(v_slug, '-\d+$', '') || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    RETURN v_slug;
END;
$$;

-- Trigger automático
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.full_name, NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON public.profiles;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- Gerar slugs para usuários existentes
UPDATE public.profiles SET slug = generate_unique_slug(full_name, id)
WHERE slug IS NULL OR slug = '';

-- =============================================
-- 3. FUNCTIONS PARA DASHBOAR D
-- =============================================

-- Estatísticas gerais
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'total_professionals', (SELECT COUNT(*) FROM profiles WHERE role = 'professional'),
        'total_points', (SELECT COALESCE(SUM(total_points), 0) FROM user_gamification),
        'total_medals', (SELECT COUNT(*) FROM user_medals),
        'total_confraternities', (SELECT COUNT(*) FROM confraternities)
    );
END;
$$;

-- Top usuários
CREATE OR REPLACE FUNCTION public.get_top_users_by_vigor(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    slug TEXT,
    total_points INTEGER,
    rank_name TEXT,
    plan_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.slug,
        ug.total_points,
        r.name,
        s.plan_id
    FROM profiles p
    INNER JOIN user_gamification ug ON ug.user_id = p.id
    INNER JOIN ranks r ON r.id = ug.current_rank_id
    LEFT JOIN subscriptions s ON s.user_id = p.id
    ORDER BY ug.total_points DESC
    LIMIT p_limit;
END;
$$;

-- Últimas medalhas
CREATE OR REPLACE FUNCTION public.get_recent_achievements(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    slug TEXT,
    medal_name TEXT,
    medal_icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.slug,
        m.name,
        m.icon,
        um.earned_at
    FROM user_medals um
    INNER JOIN profiles p ON p.id = um.user_id
    INNER JOIN medals m ON m.id = um.medal_id
    ORDER BY um.earned_at DESC
    LIMIT p_limit;
END;
$$;

-- Confraternizações recentes
CREATE OR REPLACE FUNCTION public.get_recent_confraternities(p_limit INTEGER DEFAULT 12)
RETURNS TABLE (
    member1_name TEXT,
    member2_name TEXT,
    location TEXT,
    date_occurred TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p1.full_name,
        p2.full_name,
        c.location,
        c.date_occurred
    FROM confraternities c
    JOIN profiles p1 ON p1.id = c.member1_id
    JOIN profiles p2 ON p2.id = c.member2_id
    WHERE c.visibility = 'public'
    ORDER BY c.date_occurred DESC
    LIMIT p_limit;
END;
$$;

-- =============================================
-- VERIFICAÇÃO
-- =============================================
SELECT 'Instalação completa!' as status;
SELECT * FROM get_platform_stats();
SELECT * FROM get_top_users_by_vigor(3);
