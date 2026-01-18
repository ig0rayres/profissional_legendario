-- =============================================
-- ELO DA ROTA - ESTRUTURA COMPLETA
-- Data: 17/01/2026
-- =============================================

-- =============================================
-- 1. EXECUTAR ESTRUTURA DE PERFIL (se ainda não foi)
-- =============================================

-- 1.1 Tabela Portfolio
CREATE TABLE IF NOT EXISTS public.portfolio_items (
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
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON public.portfolio_items(user_id, display_order);

-- 1.2 Function: Estatísticas de Confraria
CREATE OR REPLACE FUNCTION public.get_user_confraternity_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_created', COUNT(DISTINCT CASE WHEN ce.creator_id = p_user_id THEN ce.id END),
        'total_attended', COUNT(DISTINCT CASE WHEN ca.user_id = p_user_id AND ca.status = 'accepted' THEN ce.id END),
        'total_photos', COUNT(DISTINCT cp.id),
        'next_event', (
            SELECT json_build_object(
                'id', ce2.id,
                'title', ce2.title,
                'date', ce2.event_date
            )
            FROM confraternity_events ce2
            LEFT JOIN confraternity_acceptances ca2 ON ca2.event_id = ce2.id
            WHERE (ce2.creator_id = p_user_id OR (ca2.user_id = p_user_id AND ca2.status = 'accepted'))
              AND ce2.event_date >= NOW()
            ORDER BY ce2.event_date ASC
            LIMIT 1
        )
    ) INTO v_result
    FROM confraternity_events ce
    LEFT JOIN confraternity_acceptances ca ON ca.event_id = ce.id
    LEFT JOIN confraternity_photos cp ON cp.event_id = ce.id AND cp.uploaded_by = p_user_id
    WHERE ce.creator_id = p_user_id 
       OR (ca.user_id = p_user_id AND ca.status = 'accepted');
    
    RETURN COALESCE(v_result, '{"total_created":0,"total_attended":0,"total_photos":0,"next_event":null}'::json);
END;
$$;

-- 1.3 Function: Estatísticas de Avaliações
CREATE OR REPLACE FUNCTION public.get_rating_stats(p_professional_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'average_rating', COALESCE(AVG(rating), 0),
        'total_ratings', COUNT(*),
        'distribution', json_build_object(
            '5_stars', COUNT(*) FILTER (WHERE rating = 5),
            '4_stars', COUNT(*) FILTER (WHERE rating = 4),
            '3_stars', COUNT(*) FILTER (WHERE rating = 3),
            '2_stars', COUNT(*) FILTER (WHERE rating = 2),
            '1_star', COUNT(*) FILTER (WHERE rating = 1)
        )
    ) INTO v_result
    FROM ratings
    WHERE professional_id = p_professional_id;
    
    RETURN COALESCE(v_result, '{"average_rating":0,"total_ratings":0,"distribution":{"5_stars":0,"4_stars":0,"3_stars":0,"2_stars":0,"1_star":0}}'::json);
END;
$$;

-- 1.4 RLS Policies - Portfolio
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio items são públicos" ON public.portfolio_items;
CREATE POLICY "Portfolio items são públicos"
ON public.portfolio_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Usuário pode inserir próprio portfolio" ON public.portfolio_items;
CREATE POLICY "Usuário pode inserir próprio portfolio"
ON public.portfolio_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário pode atualizar próprio portfolio" ON public.portfolio_items;
CREATE POLICY "Usuário pode atualizar próprio portfolio"
ON public.portfolio_items FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário pode deletar próprio portfolio" ON public.portfolio_items;
CREATE POLICY "Usuário pode deletar próprio portfolio"
ON public.portfolio_items FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- 2. SISTEMA DE SLUGS (URLs Amigáveis)
-- =============================================

-- 2.1 Adicionar coluna slug
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- 2.2 Function: Gerar slug único
CREATE OR REPLACE FUNCTION public.generate_unique_slug(p_name TEXT, p_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_slug TEXT;
    v_slug TEXT;
    v_counter INTEGER := 1;
    v_exists BOOLEAN;
BEGIN
    -- Converter nome para slug: "João Silva" → "joao-silva"
    v_base_slug := lower(trim(p_name));
    v_base_slug := regexp_replace(v_base_slug, '[áàãâä]', 'a', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[éèêë]', 'e', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[íìîï]', 'i', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[óòõôö]', 'o', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[úùûü]', 'u', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[ç]', 'c', 'g');
    v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');
    v_base_slug := regexp_replace(v_base_slug, '^-+|-+$', '', 'g');
    
    v_slug := v_base_slug;
    
    -- Verificar se já existe e adicionar número se necessário
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE slug = v_slug 
            AND (p_user_id IS NULL OR id != p_user_id)
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
        
        v_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    RETURN v_slug;
END;
$$;

-- 2.3 Trigger: Gerar slug automaticamente ao criar usuário
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
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- 2.4 Gerar slugs para usuários existentes
UPDATE public.profiles
SET slug = generate_unique_slug(full_name, id)
WHERE slug IS NULL OR slug = '';

-- =============================================
-- 3. FUNCTIONS PARA DASHBOARD "ELO DA ROTA"
-- =============================================

-- 3.1 Function: Estatísticas Gerais da Plataforma
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_total_confraternities INTEGER := 0;
    v_total_photos INTEGER := 0;
BEGIN
    -- Verificar se tabelas de confraternity existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'confraternity_events') THEN
        SELECT COUNT(*) INTO v_total_confraternities FROM confraternity_events;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'confraternity_photos') THEN
        SELECT COUNT(*) INTO v_total_photos FROM confraternity_photos;
    END IF;
    
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'total_professionals', (SELECT COUNT(*) FROM profiles WHERE role = 'professional'),
        'total_points_distributed', (SELECT COALESCE(SUM(total_points), 0) FROM user_gamification),
        'total_medals_earned', (SELECT COUNT(*) FROM user_medals),
        'total_confraternities', v_total_confraternities,
        'total_photos', v_total_photos,
        'total_projects', 0,
        'total_revenue', 0
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- 3.2 Function: Top Usuários por Vigor
CREATE OR REPLACE FUNCTION public.get_top_users_by_vigor(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    slug TEXT,
    total_points INTEGER,
    current_rank_id TEXT,
    rank_name TEXT,
    rank_icon TEXT,
    plan_id TEXT,
    total_medals INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.full_name,
        p.email,
        p.slug,
        ug.total_points,
        ug.current_rank_id,
        r.name as rank_name,
        r.icon as rank_icon,
        s.plan_id,
        ug.total_medals
    FROM profiles p
    INNER JOIN user_gamification ug ON ug.user_id = p.id
    INNER JOIN ranks r ON r.id = ug.current_rank_id
    LEFT JOIN subscriptions s ON s.user_id = p.id
    ORDER BY ug.total_points DESC
    LIMIT p_limit;
END;
$$;

-- 3.3 Function: Últimas Conquistas (Medalhas Recentes)
CREATE OR REPLACE FUNCTION public.get_recent_achievements(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    slug TEXT,
    medal_id TEXT,
    medal_name TEXT,
    medal_icon TEXT,
    medal_points INTEGER,
    earned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.full_name,
        p.slug,
        um.medal_id,
        m.name as medal_name,
        m.icon as medal_icon,
        m.points_reward as medal_points,
        um.earned_at
    FROM user_medals um
    INNER JOIN profiles p ON p.id = um.user_id
    INNER JOIN medals m ON m.id = um.medal_id
    ORDER BY um.earned_at DESC
    LIMIT p_limit;
END;
$$;

-- 3.4 Function: Fotos Recentes da Confraria
CREATE OR REPLACE FUNCTION public.get_recent_confraternity_photos(p_limit INTEGER DEFAULT 12)
RETURNS TABLE (
    photo_id UUID,
    photo_url TEXT,
    event_id UUID,
    event_title TEXT,
    uploaded_by UUID,
    uploader_name TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se tabelas existem antes de consultar
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'confraternity_photos') THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        cp.id as photo_id,
        cp.photo_url,
        cp.event_id,
        ce.title as event_title,
        cp.uploaded_by,
        p.full_name as uploader_name,
        cp.uploaded_at
    FROM confraternity_photos cp
    INNER JOIN confraternity_events ce ON ce.id = cp.event_id
    INNER JOIN profiles p ON p.id = cp.uploaded_by
    ORDER BY cp.uploaded_at DESC
    LIMIT p_limit;
END;
$$;

-- =============================================
-- 4. TABELA DE PROJETOS (Opcional - para futuro)
-- =============================================

-- TODO: Implementar quando necessário
-- CREATE TABLE IF NOT EXISTS public.projects (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title TEXT NOT NULL,
--     description TEXT,
--     client_id UUID REFERENCES profiles(id),
--     budget_min DECIMAL,
--     budget_max DECIMAL,
--     status TEXT DEFAULT 'open',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- =============================================
-- 5. VERIFICAÇÃO FINAL
-- =============================================

SELECT 
    'Estrutura completa instalada!' as status,
    (SELECT COUNT(*) FROM profiles WHERE slug IS NOT NULL) as profiles_with_slug,
    (SELECT COUNT(*) FROM portfolio_items) as portfolio_items;

-- Testar functions
SELECT * FROM get_top_users_by_vigor(5);
SELECT * FROM get_recent_achievements(5);
SELECT get_platform_stats();

-- Verificar se tudo foi criado corretamente
SELECT 
    'portfolio_items' as tabela, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_items') 
        THEN '✅ Criada' ELSE '❌ Não existe' END as status
UNION ALL
SELECT 
    'slug column', 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'slug') 
        THEN '✅ Criada' ELSE '❌ Não existe' END
UNION ALL
SELECT 
    'get_platform_stats()', 
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_platform_stats') 
        THEN '✅ Criada' ELSE '❌ Não existe' END
UNION ALL
SELECT 
    'get_top_users_by_vigor()', 
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_top_users_by_vigor') 
        THEN '✅ Criada' ELSE '❌ Não existe' END
UNION ALL
SELECT 
    'get_recent_achievements()', 
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recent_achievements') 
        THEN '✅ Criada' ELSE '❌ Não existe' END;
