-- ============================================
-- ELO DA ROTA - SCHEMA COMPLETO
-- Sistema de Confraternizações e Networking
-- ============================================

-- ====================================
-- 1. CONFRATERNITY INVITES
-- ====================================
CREATE TABLE IF NOT EXISTS public.confraternity_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending', 
    -- 'pending', 'accepted', 'rejected', 'completed'
    proposed_date timestamp with time zone,
    location text,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    completed_at timestamp with time zone,
    
    -- Constraints
    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    CHECK (sender_id != receiver_id),
    UNIQUE(sender_id, receiver_id, created_at)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_confraternity_invites_sender 
    ON public.confraternity_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_confraternity_invites_receiver 
    ON public.confraternity_invites(receiver_id);
CREATE INDEX IF NOT EXISTS idx_confraternity_invites_status 
    ON public.confraternity_invites(status);

-- RLS Policies
ALTER TABLE public.confraternity_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invites" ON public.confraternity_invites
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can create invites" ON public.confraternity_invites
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can update their invites" ON public.confraternity_invites
    FOR UPDATE USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- ====================================
-- 2. CONFRATERNITIES (Realizadas)
-- ====================================
CREATE TABLE IF NOT EXISTS public.confraternities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id uuid REFERENCES public.confraternity_invites(id) ON DELETE SET NULL,
    member1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_occurred timestamp with time zone NOT NULL,
    location text,
    description text,
    photos jsonb DEFAULT '[]'::jsonb, -- Array de URLs
    testimonial_member1 text,
    testimonial_member2 text,
    visibility text NOT NULL DEFAULT 'connections', 
    -- 'private', 'connections', 'public'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Constraints
    CHECK (member1_id != member2_id),
    CHECK (visibility IN ('private', 'connections', 'public')),
    CHECK (jsonb_array_length(photos) <= 5) -- Máximo 5 fotos
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_confraternities_member1 
    ON public.confraternities(member1_id);
CREATE INDEX IF NOT EXISTS idx_confraternities_member2 
    ON public.confraternities(member2_id);
CREATE INDEX IF NOT EXISTS idx_confraternities_date 
    ON public.confraternities(date_occurred DESC);
CREATE INDEX IF NOT EXISTS idx_confraternities_visibility 
    ON public.confraternities(visibility);

-- RLS Policies
ALTER TABLE public.confraternities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public confraternities" ON public.confraternities
    FOR SELECT USING (
        visibility = 'public'
    );

CREATE POLICY "Users can view their own confraternities" ON public.confraternities
    FOR SELECT USING (
        auth.uid() = member1_id OR auth.uid() = member2_id
    );

CREATE POLICY "Users can create confraternities" ON public.confraternities
    FOR INSERT WITH CHECK (
        auth.uid() = member1_id OR auth.uid() = member2_id
    );

CREATE POLICY "Members can update their confraternities" ON public.confraternities
    FOR UPDATE USING (
        auth.uid() = member1_id OR auth.uid() = member2_id
    );

-- ====================================
-- 3. CONFRATERNITY LIMITS
-- ====================================
CREATE TABLE IF NOT EXISTS public.confraternity_limits (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    month_year text NOT NULL, -- 'YYYY-MM'
    invites_sent integer DEFAULT 0 NOT NULL,
    last_reset_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_confraternity_limits_month 
    ON public.confraternity_limits(month_year);

-- RLS Policies
ALTER TABLE public.confraternity_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own limits" ON public.confraternity_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own limits" ON public.confraternity_limits
    FOR ALL USING (auth.uid() = user_id);

-- ====================================
-- 4. CONNECTIONS (Elos)
-- ====================================
CREATE TABLE IF NOT EXISTS public.connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    -- 'pending', 'accepted', 'rejected'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    
    -- Constraints
    CHECK (status IN ('pending', 'accepted', 'rejected')),
    CHECK (requester_id != receiver_id),
    UNIQUE(requester_id, receiver_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_connections_requester 
    ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver 
    ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status 
    ON public.connections(status);

-- RLS Policies
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections" ON public.connections
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can create connections" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connections" ON public.connections
    FOR UPDATE USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- ====================================
-- 5. MESSAGES (Mensagens de Irmandade)
-- ====================================
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (sender_id != receiver_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_messages_sender 
    ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver 
    ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created 
    ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread 
    ON public.messages(receiver_id, is_read) WHERE is_read = false;

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- ====================================
-- FUNÇÕES SQL
-- ====================================

-- Função: Verificar limite de convites do usuário
CREATE OR REPLACE FUNCTION public.check_confraternity_limit(
    p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_month text;
    v_invites_sent integer;
    v_max_invites integer;
    v_user_plan text;
BEGIN
    -- Obter mês atual
    v_current_month := to_char(now(), 'YYYY-MM');
    
    -- Obter plano do usuário (assumindo que está em subscription_tier)
    SELECT subscription_tier INTO v_user_plan
    FROM profiles
    WHERE id = p_user_id;
    
    -- Definir limite baseado no plano
    v_max_invites := CASE v_user_plan
        WHEN 'recruta' THEN 0
        WHEN 'veterano' THEN 2
        WHEN 'elite' THEN 10
        ELSE 0
    END;
    
    -- Se limite é 0, retorna false
    IF v_max_invites = 0 THEN
        RETURN false;
    END IF;
    
    -- Buscar ou criar registro de limite
    INSERT INTO confraternity_limits (user_id, month_year, invites_sent)
    VALUES (p_user_id, v_current_month, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET month_year = v_current_month,
        invites_sent = CASE 
            WHEN confraternity_limits.month_year != v_current_month THEN 0
            ELSE confraternity_limits.invites_sent
        END;
    
    -- Obter total de convites enviados no mês
    SELECT invites_sent INTO v_invites_sent
    FROM confraternity_limits
    WHERE user_id = p_user_id;
    
    -- Retornar se ainda tem convites disponíveis
    RETURN v_invites_sent < v_max_invites;
END;
$$;

-- Função: Incrementar contador de convites
CREATE OR REPLACE FUNCTION public.increment_confraternity_count(
    p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_month text;
BEGIN
    v_current_month := to_char(now(), 'YYYY-MM');
    
    INSERT INTO confraternity_limits (user_id, month_year, invites_sent)
    VALUES (p_user_id, v_current_month, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET invites_sent = confraternity_limits.invites_sent + 1,
        month_year = v_current_month,
        updated_at = now();
END;
$$;

-- Função: Verificar se dois usuários são elos
CREATE OR REPLACE FUNCTION public.are_connected(
    p_user1_id uuid,
    p_user2_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM connections
        WHERE status = 'accepted'
        AND (
            (requester_id = p_user1_id AND receiver_id = p_user2_id)
            OR
            (requester_id = p_user2_id AND receiver_id = p_user1_id)
        )
    );
$$;

-- ====================================
-- NOVAS BADGES PARA CONFRARIA
-- ====================================

INSERT INTO public.badges (id, name, description, xp_reward, criteria_type, benefit_description, icon_key, is_active)
VALUES
('primeira_confraria', 'Primeiro Encontro', 'Complete sua primeira confraternização', 100, 'first_confraternity', 'Destaque no perfil + Acesso a eventos exclusivos', 'Handshake', true),
('networker_ativo', 'Networker Ativo', 'Realize 2 confrarias no mês', 200, 'confraternities_monthly_2', 'Badge exclusiva + Prioridade em buscas', 'Network', true),
('lider_confraria', 'Líder de Confraria', 'Realize 5 confrarias no mês', 500, 'confraternities_monthly_5', 'Badge de Líder + Destaque no ranking', 'Trophy', true),
('mestre_conexoes', 'Mestre das Conexões', 'Realize 10 confrarias no mês', 1000, 'confraternities_monthly_10', 'Hall da Fama + Selo "Expert em Networking"', 'Crown', true)
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    criteria_type = EXCLUDED.criteria_type;

-- ====================================
-- TRIGGERS
-- ====================================

-- Trigger: Atualizar updated_at em confraternities
CREATE OR REPLACE FUNCTION update_confraternity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_confraternities_timestamp
    BEFORE UPDATE ON public.confraternities
    FOR EACH ROW
    EXECUTE FUNCTION update_confraternity_timestamp();

-- ====================================
-- VIEWS ÚTEIS
-- ====================================

-- View: Confraternidades com informações dos membros
CREATE OR REPLACE VIEW confraternities_with_members AS
SELECT 
    c.*,
    p1.full_name as member1_name,
    p2.full_name as member2_name
FROM confraternities c
JOIN profiles p1 ON p1.id = c.member1_id
JOIN profiles p2 ON p2.id = c.member2_id;

-- View: Contagem de confraternidades por usuário
CREATE OR REPLACE VIEW user_confraternity_stats AS
SELECT 
    user_id,
    COUNT(*) as total_confraternities,
    COUNT(*) FILTER (WHERE date_occurred >= date_trunc('month', now())) as this_month
FROM (
    SELECT member1_id as user_id, date_occurred FROM confraternities
    UNION ALL
    SELECT member2_id as user_id, date_occurred FROM confraternities
) combined
GROUP BY user_id;

-- ====================================
-- COMENTÁRIOS
-- ====================================

COMMENT ON TABLE confraternity_invites IS 'Convites de confraternização entre membros';
COMMENT ON TABLE confraternities IS 'Confraternizações realizadas e documentadas';
COMMENT ON TABLE confraternity_limits IS 'Controle de limites mensais de convites por usuário';
COMMENT ON TABLE connections IS 'Conexões (elos) entre membros da plataforma';
COMMENT ON TABLE messages IS 'Sistema de mensagens privadas (Mensagens de Irmandade)';

-- ====================================
-- FIM DO SCHEMA
-- ====================================
