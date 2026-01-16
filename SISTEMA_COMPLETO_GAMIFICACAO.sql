-- =============================================
-- 🎯 SISTEMA CENTRALIZADO - RESETAR E RECRIAR TUDO
-- =============================================

-- =============================================
-- PASSO 1: DELETAR TUDO (RESET COMPLETO)
-- =============================================
DROP TABLE IF EXISTS public.user_medals CASCADE;
DROP TABLE IF EXISTS public.medals CASCADE;
DROP TABLE IF EXISTS public.user_gamification CASCADE;
DROP TABLE IF EXISTS public.ranks CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plan_tiers CASCADE;

-- =============================================
-- PASSO 2: DEFINIÇÕES DOS PLANOS (ÚNICA FONTE)
-- =============================================
CREATE TABLE public.plan_tiers (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    monthly_price decimal(10,2) NOT NULL,
    xp_multiplier decimal(3,2) NOT NULL,
    features jsonb,
    is_active boolean DEFAULT true,
    display_order integer,
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.plan_tiers IS 'FONTE ÚNICA para definições de planos e benefícios';

-- Inserir planos com multiplicadores
INSERT INTO public.plan_tiers (id, name, description, monthly_price, xp_multiplier, display_order, features) VALUES
('recruta', 'Recruta', 'Plano gratuito para iniciantes', 0.00, 1.00, 1, '{"network_limit": 10, "projects": 3, "marketplace": false}'::jsonb),
('veterano', 'Veterano', 'Para profissionais em crescimento', 97.00, 1.50, 2, '{"network_limit": 50, "projects": 10, "marketplace": true}'::jsonb),
('elite', 'Elite', 'Máximo desempenho e benefícios', 297.00, 3.00, 3, '{"network_limit": -1, "projects": -1, "marketplace": true, "priority_support": true}'::jsonb);

-- =============================================
-- PASSO 3: ASSINATURAS DOS USUÁRIOS
-- =============================================
CREATE TABLE public.subscriptions (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id text REFERENCES public.plan_tiers(id) DEFAULT 'recruta' NOT NULL,
    status text CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')) DEFAULT 'active',
    started_at timestamptz DEFAULT now(),
    current_period_end timestamptz,
    cancel_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas ativas dos usuários';
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- =============================================
-- PASSO 3: TABELA DE RANKS (PATENTES)
-- =============================================
CREATE TABLE public.ranks (
    id text PRIMARY KEY,
    name text NOT NULL,
    rank_level integer NOT NULL UNIQUE,
    points_required integer NOT NULL,
    icon text,
    color text,
    description text
);

COMMENT ON TABLE public.ranks IS 'Definição dos níveis de patente';

-- Inserir ranks
INSERT INTO public.ranks (id, name, rank_level, points_required, icon, color, description) VALUES
('recruit', 'Recruta', 1, 0, '🔰', '#94a3b8', 'Iniciante na jornada'),
('explorer', 'Explorador', 2, 100, '🧭', '#3b82f6', 'Começando a explorar'),
('adventurer', 'Aventureiro', 3, 250, '⚔️', '#8b5cf6', 'Ganhando experiência'),
('warrior', 'Guerreiro', 4, 500, '🛡️', '#f59e0b', 'Lutador experiente'),
('veteran', 'Veterano', 5, 1000, '🏆', '#ef4444', 'Mestre da jornada'),
('elite', 'Elite', 6, 2500, '👑', '#eab308', 'Entre os melhores'),
('legend', 'Lendário', 7, 5000, '⭐', '#a855f7', 'Status lendário');

-- =============================================
-- PASSO 4: TABELA DE GAMIFICAÇÃO (ÚNICA FONTE)
-- =============================================
CREATE TABLE public.user_gamification (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_rank_id text REFERENCES public.ranks(id) DEFAULT 'recruit' NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    total_medals integer DEFAULT 0 NOT NULL,
    streak_days integer DEFAULT 0,
    last_activity_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.user_gamification IS 'FONTE ÚNICA para pontos, rank e progresso do usuário';

-- =============================================
-- PASSO 5: TABELA DE MEDALHAS (DEFINIÇÕES)
-- =============================================
CREATE TABLE public.medals (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    icon text,
    points_reward integer DEFAULT 0,
    category text
);

COMMENT ON TABLE public.medals IS 'Definições de medalhas disponíveis';

INSERT INTO public.medals (id, name, description, icon, points_reward, category) VALUES
('first_login', 'Primeiro Acesso', 'Fez login pela primeira vez', '🎯', 10, 'social'),
('profile_complete', 'Perfil Completo', 'Completou 100% do perfil', '✅', 50, 'profile'),
('first_project', 'Primeiro Projeto', 'Criou o primeiro projeto', '🚀', 100, 'projects'),
('networker', 'Networker', 'Conectou com 10 pessoas', '🤝', 75, 'social'),
('verified', 'Verificado', 'Conta verificada', '✔️', 25, 'profile');

-- =============================================
-- PASSO 6: TABELA DE MEDALHAS DOS USUÁRIOS
-- =============================================
CREATE TABLE public.user_medals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medal_id text REFERENCES public.medals(id) NOT NULL,
    earned_at timestamptz DEFAULT now(),
    UNIQUE(user_id, medal_id)
);

COMMENT ON TABLE public.user_medals IS 'Medalhas conquistadas pelos usuários';

-- =============================================
-- PASSO 7: ÍNDICES PARA PERFORMANCE
-- =============================================
-- Índices já criados acima junto com a tabela subscriptions
CREATE INDEX idx_user_gamification_rank ON public.user_gamification(current_rank_id);
CREATE INDEX idx_user_gamification_points ON public.user_gamification(total_points);
CREATE INDEX idx_user_medals_user_id ON public.user_medals(user_id);

-- =============================================
-- PASSO 8: TRIGGER - CRIAR TUDO AUTOMATICAMENTE
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- 1. Criar perfil
    INSERT INTO public.profiles (
        id, email, full_name, cpf, role, rota_number, verification_status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'rota_number',
        'pending'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- 2. Criar plano (Recruta grátis por padrão)
    INSERT INTO public.subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 'recruta', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 3. Criar gamificação (Patente Recruta, 0 pontos)
    INSERT INTO public.user_gamification (user_id, current_rank_id, total_points, total_medals)
    VALUES (NEW.id, 'recruit', 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PASSO 9: TRIGGER - ATUALIZAR RANK AUTOMÁTICO
-- =============================================
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_rank_id text;
BEGIN
    -- Buscar rank baseado nos pontos
    SELECT id INTO v_new_rank_id
    FROM public.ranks
    WHERE points_required <= NEW.total_points
    ORDER BY points_required DESC
    LIMIT 1;
    
    IF v_new_rank_id IS NOT NULL THEN
        NEW.current_rank_id := v_new_rank_id;
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_rank_on_points_change ON public.user_gamification;
CREATE TRIGGER update_rank_on_points_change
    BEFORE UPDATE OF total_points ON public.user_gamification
    FOR EACH ROW
    WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points)
    EXECUTE FUNCTION public.update_user_rank();

-- =============================================
-- PASSO 10: FUNÇÃO PARA DAR MEDALHA + PONTOS COM MULTIPLICADOR
-- =============================================
CREATE OR REPLACE FUNCTION public.award_medal(p_user_id uuid, p_medal_id text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_points integer;
    v_multiplier decimal(3,2);
    v_final_points integer;
    v_exists boolean;
BEGIN
    -- Verificar se já ganhou
    SELECT EXISTS(
        SELECT 1 FROM public.user_medals 
        WHERE user_id = p_user_id AND medal_id = p_medal_id
    ) INTO v_exists;
    
    IF v_exists THEN
        RETURN false;
    END IF;
    
    -- Buscar pontos base da medalha
    SELECT points_reward INTO v_base_points 
    FROM public.medals 
    WHERE id = p_medal_id;
    
    -- Buscar multiplicador do plano do usuário
    SELECT pt.xp_multiplier INTO v_multiplier
    FROM public.subscriptions s
    JOIN public.plan_tiers pt ON pt.id = s.plan_id
    WHERE s.user_id = p_user_id AND s.status = 'active';
    
    -- Se não tem plano ativo, usar multiplicador 1.0
    v_multiplier := COALESCE(v_multiplier, 1.00);
    
    -- Calcular pontos finais com multiplicador
    v_final_points := FLOOR(COALESCE(v_base_points, 0) * v_multiplier);
    
    -- Dar medalha
    INSERT INTO public.user_medals (user_id, medal_id) 
    VALUES (p_user_id, p_medal_id);
    
    -- Adicionar pontos com multiplicador (trigger atualizará rank automaticamente)
    UPDATE public.user_gamification
    SET total_points = total_points + v_final_points,
        total_medals = total_medals + 1
    WHERE user_id = p_user_id;
    
    RETURN true;
END;
$$;

-- =============================================
-- PASSO 11: RLS (SEGURANÇA)
-- =============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medals ENABLE ROW LEVEL SECURITY;

-- Subscriptions
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Gamification (público pode ver)
DROP POLICY IF EXISTS "Public view gamification" ON public.user_gamification;
CREATE POLICY "Public view gamification" ON public.user_gamification
    FOR SELECT USING (true);

-- Medals
DROP POLICY IF EXISTS "Users view own medals" ON public.user_medals;
CREATE POLICY "Users view own medals" ON public.user_medals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public view all medals" ON public.user_medals;
CREATE POLICY "Public view all medals" ON public.user_medals
    FOR SELECT USING (true);

-- =============================================
-- PASSO 12: MIGRAR USUÁRIOS EXISTENTES
-- =============================================
DO $$
DECLARE
    v_user RECORD;
    v_count_subs integer := 0;
    v_count_gamif integer := 0;
BEGIN
    FOR v_user IN SELECT id FROM auth.users LOOP
        -- Subscription
        INSERT INTO public.subscriptions (user_id, plan_id, status)
        VALUES (v_user.id, 'recruta', 'active')
        ON CONFLICT (user_id) DO NOTHING;
        v_count_subs := v_count_subs + 1;
        
        -- Gamification
        INSERT INTO public.user_gamification (user_id, current_rank_id, total_points, total_medals)
        VALUES (v_user.id, 'recruit', 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        v_count_gamif := v_count_gamif + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Migrados % subscriptions e % gamification', v_count_subs, v_count_gamif;
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
SELECT 
    '✅ SISTEMA COMPLETO ATIVO' as status;

SELECT 'RANKS' as tabela, count(*) as registros FROM public.ranks
UNION ALL
SELECT 'MEDALS', count(*) FROM public.medals
UNION ALL
SELECT 'SUBSCRIPTIONS', count(*) FROM public.subscriptions
UNION ALL
SELECT 'GAMIFICATION', count(*) FROM public.user_gamification
ORDER BY tabela;
