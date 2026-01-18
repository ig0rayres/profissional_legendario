-- ============================================================
-- 🎮 GAMIFICAÇÃO MENSAL - SCRIPT DE MIGRAÇÃO COMPLETO
-- Rota Business Club
-- Data: 18 de Janeiro de 2026
-- ============================================================
-- 
-- Este script:
-- 1. CRIA novas tabelas para o sistema mensal
-- 2. MIGRA os dados existentes para Janeiro 2026
-- 3. CRIA novas funções SQL (NÃO sobrescreve as antigas)
-- 4. Configura triggers e índices
--
-- ⚠️ COMPATIBILIDADE RETROATIVA GARANTIDA:
-- - Tabelas antigas (user_gamification, user_medals) NÃO são removidas
-- - Funções antigas continuam funcionando
-- - Código TypeScript existente continua funcionando
-- - Apenas ADICIONA novas funcionalidades
--
-- 📋 Para reverter: Basta dropar as novas tabelas e funções
-- ============================================================

-- ============================================================
-- PARTE 1: NOVAS TABELAS
-- ============================================================

-- 1.1 Tabela de Temporadas/Seasons
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gamification_seasons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    year integer NOT NULL,
    month integer NOT NULL CHECK (month >= 1 AND month <= 12),
    name text NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(year, month)
);

-- Comentários
COMMENT ON TABLE public.gamification_seasons IS 'Temporadas mensais do sistema de gamificação';
COMMENT ON COLUMN public.gamification_seasons.year IS 'Ano da temporada (ex: 2026)';
COMMENT ON COLUMN public.gamification_seasons.month IS 'Mês da temporada (1-12)';
COMMENT ON COLUMN public.gamification_seasons.name IS 'Nome amigável (ex: Janeiro 2026)';
COMMENT ON COLUMN public.gamification_seasons.is_active IS 'Se é a temporada ativa atual';

-- RLS para seasons (leitura pública)
ALTER TABLE public.gamification_seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seasons are viewable by everyone" ON public.gamification_seasons;
CREATE POLICY "Seasons are viewable by everyone" 
    ON public.gamification_seasons 
    FOR SELECT 
    USING (true);

-- ✅ Tabela gamification_seasons criada

-- ============================================================
-- 1.2 Tabela de Stats por Temporada
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_season_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    season_id uuid REFERENCES public.gamification_seasons(id) ON DELETE CASCADE NOT NULL,
    
    -- XP do mês
    total_xp integer DEFAULT 0 NOT NULL,
    rank_id text REFERENCES public.ranks(id) DEFAULT 'recruta',
    
    -- Limites diários
    daily_xp_count integer DEFAULT 0 NOT NULL,
    last_xp_date date DEFAULT current_date,
    
    -- Posição no ranking do mês (calculado no fim do mês)
    ranking_position integer,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(user_id, season_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_season_stats_user ON public.user_season_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_stats_season ON public.user_season_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_user_season_stats_xp ON public.user_season_stats(total_xp DESC);

-- Comentários
COMMENT ON TABLE public.user_season_stats IS 'Estatísticas de gamificação por usuário por temporada';
COMMENT ON COLUMN public.user_season_stats.total_xp IS 'XP acumulado nesta temporada';
COMMENT ON COLUMN public.user_season_stats.rank_id IS 'Patente atual nesta temporada';
COMMENT ON COLUMN public.user_season_stats.ranking_position IS 'Posição no ranking (calculado no fim do mês)';

-- RLS para user_season_stats
ALTER TABLE public.user_season_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own season stats" ON public.user_season_stats;
CREATE POLICY "Users can view their own season stats" 
    ON public.user_season_stats 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view any season stats" ON public.user_season_stats;
CREATE POLICY "Users can view any season stats" 
    ON public.user_season_stats 
    FOR SELECT 
    USING (true);

-- ✅ Tabela user_season_stats criada

-- ============================================================
-- 1.3 Tabela de Medalhas por Temporada
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_season_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    season_id uuid REFERENCES public.gamification_seasons(id) ON DELETE CASCADE NOT NULL,
    badge_id text NOT NULL, -- Referência para medals.id (text)
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, season_id, badge_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_season_badges_user ON public.user_season_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_badges_season ON public.user_season_badges(season_id);

-- Comentários
COMMENT ON TABLE public.user_season_badges IS 'Medalhas conquistadas por usuário por temporada';

-- RLS para user_season_badges
ALTER TABLE public.user_season_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own season badges" ON public.user_season_badges;
CREATE POLICY "Users can view their own season badges" 
    ON public.user_season_badges 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view season badges" ON public.user_season_badges;
CREATE POLICY "Anyone can view season badges" 
    ON public.user_season_badges 
    FOR SELECT 
    USING (true);

-- ✅ Tabela user_season_badges criada

-- ============================================================
-- 1.4 Adicionar season_id na tabela xp_logs
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'xp_logs' AND column_name = 'season_id'
    ) THEN
        ALTER TABLE public.xp_logs 
        ADD COLUMN season_id uuid REFERENCES public.gamification_seasons(id);
        
        CREATE INDEX IF NOT EXISTS idx_xp_logs_season ON public.xp_logs(season_id);
        
        RAISE NOTICE '✅ Coluna season_id adicionada em xp_logs';
    ELSE
        RAISE NOTICE '⏭️ Coluna season_id já existe em xp_logs';
    END IF;
END $$;

-- ============================================================
-- PARTE 2: CRIAR TEMPORADA JANEIRO 2026
-- ============================================================

-- Criar a primeira temporada (Janeiro 2026)
INSERT INTO public.gamification_seasons (year, month, name, starts_at, ends_at, is_active)
VALUES (
    2026,
    1,
    'Janeiro 2026',
    '2026-01-01 00:00:00+00',
    '2026-01-31 23:59:59+00',
    true
)
ON CONFLICT (year, month) DO UPDATE SET is_active = true;

-- ✅ Temporada Janeiro 2026 criada e ativada

-- ============================================================
-- PARTE 3: MIGRAR DADOS EXISTENTES
-- ============================================================

-- 3.1 Migrar stats de user_gamification para user_season_stats
DO $$
DECLARE
    v_season_id uuid;
    v_count integer := 0;
BEGIN
    -- Buscar ID da temporada Janeiro 2026
    SELECT id INTO v_season_id 
    FROM gamification_seasons 
    WHERE year = 2026 AND month = 1;
    
    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'Temporada Janeiro 2026 não encontrada';
    END IF;
    
    -- Migrar dados de user_gamification (ou gamification_stats)
    -- Verificar qual tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_gamification') THEN
        -- user_gamification usa total_points, não total_xp
        -- Filtrar apenas usuários que existem em profiles (evitar FK violation)
        INSERT INTO user_season_stats (user_id, season_id, total_xp, rank_id, daily_xp_count, last_xp_date)
        SELECT 
            ug.user_id,
            v_season_id,
            COALESCE(ug.total_points, 0),
            COALESCE(ug.current_rank_id, 'recruta'),
            0,
            current_date
        FROM user_gamification ug
        WHERE EXISTS (SELECT 1 FROM profiles p WHERE p.id = ug.user_id)
        ON CONFLICT (user_id, season_id) DO UPDATE SET
            total_xp = EXCLUDED.total_xp,
            rank_id = EXCLUDED.rank_id;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
    
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamification_stats') THEN
        -- Filtrar apenas usuários que existem em profiles
        INSERT INTO user_season_stats (user_id, season_id, total_xp, rank_id, daily_xp_count, last_xp_date)
        SELECT 
            gs.user_id,
            v_season_id,
            COALESCE(gs.total_xp, 0),
            COALESCE(gs.current_rank_id, 'recruta'),
            COALESCE(gs.daily_xp_count, 0),
            COALESCE(gs.last_xp_date, current_date)
        FROM gamification_stats gs
        WHERE EXISTS (SELECT 1 FROM profiles p WHERE p.id = gs.user_id)
        ON CONFLICT (user_id, season_id) DO UPDATE SET
            total_xp = EXCLUDED.total_xp,
            rank_id = EXCLUDED.rank_id;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
    ELSE
        RAISE NOTICE '⚠️ Nenhuma tabela de gamification encontrada para migrar';
    END IF;
END $$;

-- 3.2 Migrar medalhas de user_medals para user_season_badges
DO $$
DECLARE
    v_season_id uuid;
    v_count integer := 0;
BEGIN
    -- Buscar ID da temporada Janeiro 2026
    SELECT id INTO v_season_id 
    FROM gamification_seasons 
    WHERE year = 2026 AND month = 1;
    
    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'Temporada Janeiro 2026 não encontrada';
    END IF;
    
    -- Migrar medalhas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_medals') THEN
        -- Filtrar apenas usuários que existem em profiles
        INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
        SELECT 
            um.user_id,
            v_season_id,
            um.medal_id,
            COALESCE(um.earned_at, now())
        FROM user_medals um
        WHERE EXISTS (SELECT 1 FROM profiles p WHERE p.id = um.user_id)
        ON CONFLICT (user_id, season_id, badge_id) DO NOTHING;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
    ELSE
        RAISE NOTICE '⚠️ Tabela user_medals não encontrada';
    END IF;
END $$;

-- 3.3 Atualizar xp_logs com season_id
DO $$
DECLARE
    v_season_id uuid;
    v_count integer := 0;
BEGIN
    SELECT id INTO v_season_id 
    FROM gamification_seasons 
    WHERE year = 2026 AND month = 1;
    
    IF v_season_id IS NOT NULL THEN
        UPDATE xp_logs SET season_id = v_season_id WHERE season_id IS NULL;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE '✅ Atualizados % registros de xp_logs com season_id', v_count;
    END IF;
END $$;

-- ============================================================
-- PARTE 4: FUNÇÕES SQL ATUALIZADAS
-- ============================================================

-- 4.1 Função para obter temporada ativa
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_active_season()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season_id uuid;
BEGIN
    SELECT id INTO v_season_id
    FROM gamification_seasons
    WHERE is_active = true
    LIMIT 1;
    
    -- Se não houver temporada ativa, criar uma nova
    IF v_season_id IS NULL THEN
        INSERT INTO gamification_seasons (year, month, name, starts_at, ends_at, is_active)
        VALUES (
            EXTRACT(YEAR FROM current_date)::integer,
            EXTRACT(MONTH FROM current_date)::integer,
            TO_CHAR(current_date, 'TMMonth YYYY'),
            DATE_TRUNC('month', current_date),
            DATE_TRUNC('month', current_date) + INTERVAL '1 month' - INTERVAL '1 second',
            true
        )
        RETURNING id INTO v_season_id;
    END IF;
    
    RETURN v_season_id;
END;
$$;

-- ✅ Função get_active_season criada

-- 4.2 Função add_season_xp - NOVA função para sistema mensal
-- NOTA: NÃO sobrescreve add_user_xp existente para manter compatibilidade
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_season_xp(
    p_user_id uuid,
    p_base_amount integer,
    p_action_type text,
    p_description text DEFAULT null,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season_id uuid;
    v_multiplier numeric;
    v_final_xp integer;
    v_current_daily_xp integer;
    v_last_xp_date date;
    v_daily_limit integer := 500;
    v_new_rank_id text;
    v_plan_id text;
BEGIN
    -- Obter temporada ativa
    v_season_id := get_active_season();
    
    -- Inicializar stats do usuário para esta temporada se não existir
    INSERT INTO user_season_stats (user_id, season_id, total_xp, rank_id, daily_xp_count, last_xp_date)
    VALUES (p_user_id, v_season_id, 0, 'recruta', 0, current_date)
    ON CONFLICT (user_id, season_id) DO NOTHING;
    
    -- ================================================================
    -- BUSCAR MULTIPLICADOR DO PLANO (não do rank!)
    -- Recruta: 1x | Veterano: 1.5x | Elite: 3x
    -- ================================================================
    SELECT COALESCE(s.plan_id, 'recruta')
    INTO v_plan_id
    FROM subscriptions s
    WHERE s.user_id = p_user_id AND s.status = 'active'
    LIMIT 1;
    
    -- Definir multiplicador baseado no plano
    v_multiplier := CASE v_plan_id
        WHEN 'elite' THEN 3.0
        WHEN 'veterano' THEN 1.5
        ELSE 1.0  -- recruta ou qualquer outro
    END;
    
    -- Buscar dados atuais da temporada
    SELECT daily_xp_count, last_xp_date
    INTO v_current_daily_xp, v_last_xp_date
    FROM user_season_stats
    WHERE user_id = p_user_id AND season_id = v_season_id;
    
    -- Reset diário se mudou o dia
    IF v_last_xp_date IS NULL OR v_last_xp_date < current_date THEN
        v_current_daily_xp := 0;
    END IF;
    
    -- Calcular XP final com multiplicador do PLANO
    v_final_xp := FLOOR(p_base_amount * v_multiplier);
    
    -- Aplicar limite diário (exceto para ações especiais)
    IF p_action_type NOT IN ('contract_closed', 'service_completed', 'badge_reward', 'challenge_completed', 'admin_grant') THEN
        IF v_current_daily_xp >= v_daily_limit THEN
            RETURN 0; -- Limite atingido
        END IF;
        
        IF v_current_daily_xp + v_final_xp > v_daily_limit THEN
            v_final_xp := v_daily_limit - v_current_daily_xp;
        END IF;
    END IF;
    
    -- Atualizar stats da temporada
    UPDATE user_season_stats
    SET 
        total_xp = total_xp + v_final_xp,
        daily_xp_count = CASE 
            WHEN last_xp_date < current_date THEN v_final_xp 
            ELSE daily_xp_count + v_final_xp 
        END,
        last_xp_date = current_date,
        updated_at = now()
    WHERE user_id = p_user_id AND season_id = v_season_id;
    
    -- Registrar log com informação do plano
    INSERT INTO xp_logs (user_id, season_id, amount, base_amount, action_type, description, metadata)
    VALUES (p_user_id, v_season_id, v_final_xp, p_base_amount, p_action_type, p_description, 
            p_metadata || jsonb_build_object('plan_id', v_plan_id, 'multiplier', v_multiplier));
    
    -- Verificar e atualizar rank baseado no XP do mês
    SELECT check_season_rank_up(p_user_id, v_season_id) INTO v_new_rank_id;
    
    RETURN v_final_xp;
END;
$$;

-- ✅ Função add_season_xp criada (mantém add_user_xp original)

-- 4.3 Função para verificar rank up na temporada
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_season_rank_up(
    p_user_id uuid,
    p_season_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp integer;
    v_current_rank_id text;
    v_new_rank_id text;
BEGIN
    -- Buscar XP atual da temporada
    SELECT total_xp, rank_id
    INTO v_current_xp, v_current_rank_id
    FROM user_season_stats
    WHERE user_id = p_user_id AND season_id = p_season_id;
    
    IF v_current_xp IS NULL THEN
        RETURN 'recruta';
    END IF;
    
    -- Determinar novo rank baseado no XP
    SELECT id INTO v_new_rank_id
    FROM ranks
    WHERE v_current_xp >= min_xp
      AND (max_xp IS NULL OR v_current_xp <= max_xp)
    ORDER BY min_xp DESC
    LIMIT 1;
    
    IF v_new_rank_id IS NULL THEN
        v_new_rank_id := 'recruta';
    END IF;
    
    -- Atualizar se mudou
    IF v_new_rank_id != v_current_rank_id THEN
        UPDATE user_season_stats
        SET rank_id = v_new_rank_id, updated_at = now()
        WHERE user_id = p_user_id AND season_id = p_season_id;
    END IF;
    
    RETURN v_new_rank_id;
END;
$$;

-- ✅ Função check_season_rank_up criada

-- 4.4 Função para conceder medalha ATUALIZADA
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_season_badge(
    p_user_id uuid,
    p_badge_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season_id uuid;
    v_badge_xp integer;
    v_badge_name text;
BEGIN
    -- Obter temporada ativa
    v_season_id := get_active_season();
    
    -- Verificar se já tem a medalha nesta temporada
    IF EXISTS (
        SELECT 1 FROM user_season_badges 
        WHERE user_id = p_user_id 
          AND season_id = v_season_id 
          AND badge_id = p_badge_id
    ) THEN
        RETURN false; -- Já conquistou este mês
    END IF;
    
    -- Buscar dados da medalha
    SELECT xp_reward, name INTO v_badge_xp, v_badge_name
    FROM medals
    WHERE id = p_badge_id;
    
    IF v_badge_xp IS NULL THEN
        RETURN false; -- Medalha não existe
    END IF;
    
    -- Conceder medalha
    INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
    VALUES (p_user_id, v_season_id, p_badge_id, now());
    
    -- Conceder XP da medalha
    PERFORM add_season_xp(p_user_id, v_badge_xp, 'badge_reward', 'Medalha: ' || v_badge_name);
    
    RETURN true;
END;
$$;

-- ✅ Função award_season_badge criada

-- 4.5 Função para iniciar nova temporada
-- ============================================================
CREATE OR REPLACE FUNCTION public.start_new_season()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_season_id uuid;
    v_old_season_id uuid;
    v_current_year integer := EXTRACT(YEAR FROM current_date);
    v_current_month integer := EXTRACT(MONTH FROM current_date);
    v_month_name text;
    v_count integer;
BEGIN
    -- Busca temporada ativa atual
    SELECT id INTO v_old_season_id 
    FROM gamification_seasons 
    WHERE is_active = true;
    
    -- Se existe temporada ativa, finalizá-la
    IF v_old_season_id IS NOT NULL THEN
        -- Calcular ranking final
        WITH ranked AS (
            SELECT 
                user_id,
                RANK() OVER (ORDER BY total_xp DESC) as position
            FROM user_season_stats
            WHERE season_id = v_old_season_id
        )
        UPDATE user_season_stats uss
        SET ranking_position = r.position
        FROM ranked r
        WHERE uss.user_id = r.user_id 
          AND uss.season_id = v_old_season_id;
        
        -- Desativar temporada anterior
        UPDATE gamification_seasons 
        SET is_active = false 
        WHERE id = v_old_season_id;
        
        RAISE NOTICE 'Temporada anterior finalizada com ranking calculado';
    END IF;
    
    -- Verifica se já existe temporada para este mês
    SELECT id INTO v_new_season_id
    FROM gamification_seasons
    WHERE year = v_current_year AND month = v_current_month;
    
    IF v_new_season_id IS NOT NULL THEN
        -- Apenas ativar
        UPDATE gamification_seasons SET is_active = true WHERE id = v_new_season_id;
        RETURN v_new_season_id;
    END IF;
    
    -- Nome do mês em português
    v_month_name := CASE v_current_month
        WHEN 1 THEN 'Janeiro'
        WHEN 2 THEN 'Fevereiro'
        WHEN 3 THEN 'Março'
        WHEN 4 THEN 'Abril'
        WHEN 5 THEN 'Maio'
        WHEN 6 THEN 'Junho'
        WHEN 7 THEN 'Julho'
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Setembro'
        WHEN 10 THEN 'Outubro'
        WHEN 11 THEN 'Novembro'
        WHEN 12 THEN 'Dezembro'
    END || ' ' || v_current_year;
    
    -- Criar nova temporada
    INSERT INTO gamification_seasons (year, month, name, starts_at, ends_at, is_active)
    VALUES (
        v_current_year,
        v_current_month,
        v_month_name,
        DATE_TRUNC('month', current_date),
        DATE_TRUNC('month', current_date) + INTERVAL '1 month' - INTERVAL '1 second',
        true
    )
    RETURNING id INTO v_new_season_id;
    
    -- Inicializa stats zerados para usuários ativos
    INSERT INTO user_season_stats (user_id, season_id, total_xp, rank_id)
    SELECT id, v_new_season_id, 0, 'recruta'
    FROM profiles
    WHERE id IN (SELECT DISTINCT user_id FROM user_season_stats);
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Nova temporada criada: % com % usuários inicializados', v_month_name, v_count;
    
    RETURN v_new_season_id;
END;
$$;

-- ✅ Função start_new_season criada

-- 4.6 Função para buscar histórico de temporadas do usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_season_history(
    p_user_id uuid,
    p_limit integer DEFAULT 12
)
RETURNS TABLE(
    season_id uuid,
    season_name text,
    season_year integer,
    season_month integer,
    total_xp integer,
    rank_id text,
    rank_name text,
    badges_count bigint,
    ranking_position integer,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.id as season_id,
        gs.name as season_name,
        gs.year as season_year,
        gs.month as season_month,
        uss.total_xp,
        uss.rank_id,
        r.name as rank_name,
        (SELECT COUNT(*) FROM user_season_badges usb 
         WHERE usb.user_id = p_user_id AND usb.season_id = gs.id) as badges_count,
        uss.ranking_position,
        gs.is_active
    FROM user_season_stats uss
    JOIN gamification_seasons gs ON gs.id = uss.season_id
    LEFT JOIN ranks r ON r.id = uss.rank_id
    WHERE uss.user_id = p_user_id
    ORDER BY gs.year DESC, gs.month DESC
    LIMIT p_limit;
END;
$$;

-- ✅ Função get_user_season_history criada

-- 4.7 Função para buscar stats da temporada atual
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_current_season_stats(
    p_user_id uuid
)
RETURNS TABLE(
    season_id uuid,
    season_name text,
    total_xp integer,
    rank_id text,
    rank_name text,
    rank_min_xp integer,
    rank_max_xp integer,
    plan_id text,
    plan_multiplier numeric,
    next_rank_name text,
    next_rank_min_xp integer,
    badges_earned bigint,
    total_badges bigint,
    daily_xp_remaining integer,
    ranking_position integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season_id uuid;
    v_daily_limit integer := 500;
    v_plan_id text;
    v_plan_multiplier numeric;
BEGIN
    -- Obter temporada ativa
    v_season_id := get_active_season();
    
    -- Garantir que usuário tem stats
    INSERT INTO user_season_stats (user_id, season_id, total_xp, rank_id)
    VALUES (p_user_id, v_season_id, 0, 'recruta')
    ON CONFLICT (user_id, season_id) DO NOTHING;
    
    -- Buscar multiplicador do PLANO (não do rank!)
    SELECT COALESCE(s.plan_id, 'recruta')
    INTO v_plan_id
    FROM subscriptions s
    WHERE s.user_id = p_user_id AND s.status = 'active'
    LIMIT 1;
    
    IF v_plan_id IS NULL THEN
        v_plan_id := 'recruta';
    END IF;
    
    v_plan_multiplier := CASE v_plan_id
        WHEN 'elite' THEN 3.0
        WHEN 'veterano' THEN 1.5
        ELSE 1.0
    END;
    
    RETURN QUERY
    SELECT 
        gs.id as season_id,
        gs.name as season_name,
        uss.total_xp,
        uss.rank_id,
        r.name as rank_name,
        r.min_xp as rank_min_xp,
        r.max_xp as rank_max_xp,
        v_plan_id as plan_id,
        v_plan_multiplier as plan_multiplier,
        nr.name as next_rank_name,
        nr.min_xp as next_rank_min_xp,
        (SELECT COUNT(*) FROM user_season_badges usb 
         WHERE usb.user_id = p_user_id AND usb.season_id = gs.id) as badges_earned,
        (SELECT COUNT(*) FROM medals WHERE is_active = true) as total_badges,
        CASE 
            WHEN uss.last_xp_date < current_date THEN v_daily_limit
            ELSE GREATEST(0, v_daily_limit - uss.daily_xp_count)
        END as daily_xp_remaining,
        (SELECT COUNT(*) + 1 FROM user_season_stats uss2 
         WHERE uss2.season_id = gs.id AND uss2.total_xp > uss.total_xp)::integer as ranking_position
    FROM user_season_stats uss
    JOIN gamification_seasons gs ON gs.id = uss.season_id
    LEFT JOIN ranks r ON r.id = uss.rank_id
    LEFT JOIN ranks nr ON nr.rank_level = r.rank_level + 1
    WHERE uss.user_id = p_user_id AND gs.is_active = true;
END;
$$;

-- ✅ Função get_current_season_stats criada

-- 4.8 Função para buscar medalhas da temporada atual
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_current_season_badges(
    p_user_id uuid
)
RETURNS TABLE(
    badge_id text,
    badge_name text,
    badge_description text,
    badge_xp_reward integer,
    badge_icon_key text,
    earned_at timestamp with time zone,
    is_earned boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season_id uuid;
BEGIN
    v_season_id := get_active_season();
    
    RETURN QUERY
    SELECT 
        m.id as badge_id,
        m.name as badge_name,
        m.description as badge_description,
        m.xp_reward as badge_xp_reward,
        m.icon_key as badge_icon_key,
        usb.earned_at,
        usb.id IS NOT NULL as is_earned
    FROM medals m
    LEFT JOIN user_season_badges usb ON usb.badge_id = m.id 
        AND usb.user_id = p_user_id 
        AND usb.season_id = v_season_id
    WHERE m.is_active = true
    ORDER BY m.id;
END;
$$;

-- ✅ Função get_current_season_badges criada

-- ============================================================
-- PARTE 5: VIEWS ÚTEIS
-- ============================================================

-- 5.1 View de ranking da temporada atual
CREATE OR REPLACE VIEW public.v_current_season_ranking AS
SELECT 
    p.id as user_id,
    p.full_name,
    uss.total_xp,
    r.name as rank_name,
    uss.rank_id,
    gs.name as season_name,
    RANK() OVER (ORDER BY uss.total_xp DESC) as position,
    (SELECT COUNT(*) FROM user_season_badges usb 
     WHERE usb.user_id = p.id AND usb.season_id = gs.id) as badges_count
FROM user_season_stats uss
JOIN gamification_seasons gs ON gs.id = uss.season_id AND gs.is_active = true
JOIN profiles p ON p.id = uss.user_id
LEFT JOIN ranks r ON r.id = uss.rank_id
ORDER BY uss.total_xp DESC;

-- ✅ View v_current_season_ranking criada

-- ============================================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- ============================================================

DO $$
DECLARE
    v_seasons_count integer;
    v_stats_count integer;
    v_badges_count integer;
BEGIN
    SELECT COUNT(*) INTO v_seasons_count FROM gamification_seasons;
    SELECT COUNT(*) INTO v_stats_count FROM user_season_stats;
    SELECT COUNT(*) INTO v_badges_count FROM user_season_badges;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📊 RESUMO DA MIGRAÇÃO';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📅 Temporadas criadas: %', v_seasons_count;
    RAISE NOTICE '👥 Stats de usuários migrados: %', v_stats_count;
    RAISE NOTICE '🏅 Medalhas migradas: %', v_badges_count;
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '============================================================';
END $$;
