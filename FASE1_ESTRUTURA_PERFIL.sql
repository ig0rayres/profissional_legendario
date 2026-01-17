-- =============================================
-- FASE 1: ESTRUTURA DE DADOS - PERFIL COMPLETO
-- =============================================

-- =============================================
-- 1. TABELA PORTFOLIO_ITEMS
-- =============================================
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

CREATE INDEX idx_portfolio_user ON public.portfolio_items(user_id);
CREATE INDEX idx_portfolio_order ON public.portfolio_items(user_id, display_order);

COMMENT ON TABLE public.portfolio_items IS 'Portfólio de trabalhos dos usuários';

-- =============================================
-- 2. FUNCTION: GET_USER_CONFRATERNITY_STATS
-- =============================================
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

COMMENT ON FUNCTION public.get_user_confraternity_stats IS 'Retorna estatísticas de confraternity do usuário';

-- =============================================
-- 3. FUNCTION: GET_RATING_STATS
-- =============================================
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

COMMENT ON FUNCTION public.get_rating_stats IS 'Retorna estatísticas de avaliações do profissional';

-- =============================================
-- 4. RLS POLICIES - PORTFOLIO
-- =============================================
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Todos podem VER portfolios
CREATE POLICY "Portfolio items são públicos"
ON public.portfolio_items FOR SELECT
USING (true);

-- Apenas o dono pode INSERIR
CREATE POLICY "Usuário pode inserir próprio portfolio"
ON public.portfolio_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Apenas o dono pode ATUALIZAR
CREATE POLICY "Usuário pode atualizar próprio portfolio"
ON public.portfolio_items FOR UPDATE
USING (auth.uid() = user_id);

-- Apenas o dono pode DELETAR
CREATE POLICY "Usuário pode deletar próprio portfolio"
ON public.portfolio_items FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- 5. VERIFICAÇÃO
-- =============================================
SELECT 'Tabela portfolio_items criada' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'portfolio_items'
);

SELECT 'Function get_user_confraternity_stats criada' as status
WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_user_confraternity_stats'
);

SELECT 'Function get_rating_stats criada' as status
WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_rating_stats'
);

-- =============================================
-- 6. TESTE DAS FUNCTIONS
-- =============================================
-- Testar com um usuário (substitua pelo ID real)
-- SELECT get_user_confraternity_stats('[ID_DO_USUARIO]');
-- SELECT get_rating_stats('[ID_DO_USUARIO]');
