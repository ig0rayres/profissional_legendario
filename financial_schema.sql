-- ============================================
-- FINANCIAL MANAGEMENT SCHEMA
-- Sistema completo de gestão financeira
-- ============================================

-- ====================================
-- 1. HISTÓRICO DE MUDANÇAS DE PLANO
-- ====================================
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    from_tier text,  -- 'recruta', 'veterano', 'elite'
    to_tier text NOT NULL,
    changed_by uuid REFERENCES public.profiles(id), -- Admin que fez a mudança
    reason text, -- Motivo da mudança
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (from_tier IN ('recruta', 'veterano', 'elite') OR from_tier IS NULL),
    CHECK (to_tier IN ('recruta', 'veterano', 'elite'))
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_date ON public.subscription_history(created_at DESC);

-- ====================================
-- 2. TRANSAÇÕES SIMULADAS
-- ====================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount decimal(10,2) NOT NULL,
    plan_tier text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method text, -- 'credit_card', 'pix', 'boleto', etc
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    
    CHECK (plan_tier IN ('recruta', 'veterano', 'elite')),
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(created_at DESC);

-- ====================================
-- 3. CONFIGURAÇÃO DE PLANOS
-- ====================================
CREATE TABLE IF NOT EXISTS public.plan_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tier text UNIQUE NOT NULL, -- 'recruta', 'veterano', 'elite'
    name text NOT NULL,
    price decimal(10,2) NOT NULL,
    features jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    display_order integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (tier IN ('recruta', 'veterano', 'elite')),
    CHECK (price >= 0)
);

-- Seed inicial de planos
INSERT INTO public.plan_config (tier, name, price, features, display_order) VALUES
('recruta', 'Recruta', 0, '["Perfil Básico", "Listagem na busca", "1 Especialidade", "Acesso à comunidade"]', 1),
('veterano', 'Veterano', 47, '["Perfil Completo", "Destaque na busca", "Até 3 Especialidades", "Selo de Verificado", "Galeria de Projetos (5)", "Receber Avaliações"]', 2),
('elite', 'Elite', 147, '["Tudo do plano Veterano", "Destaque Premium na Home", "Especialidades Ilimitadas", "Selo Elite Dourado", "Galeria Ilimitada", "Acesso a Eventos Exclusivos", "Mentoria Mensal em Grupo"]', 3)
ON CONFLICT (tier) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    display_order = EXCLUDED.display_order,
    updated_at = now();

-- ====================================
-- 4. CUPONS DE DESCONTO
-- ====================================
CREATE TABLE IF NOT EXISTS public.discount_coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL, -- Código do cupom (ex: 'BEMVINDO2024')
    name text NOT NULL, -- Nome descritivo
    description text,
    discount_type text NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value decimal(10,2) NOT NULL, -- % ou valor fixo
    
    -- Restrições
    applicable_plans text[] DEFAULT NULL, -- Quais planos pode aplicar (null = todos)
    min_purchase_amount decimal(10,2), -- Valor mínimo de compra
    max_discount_amount decimal(10,2), -- Desconto máximo (para %)
    
    -- Limites de uso
    usage_limit integer, -- Quantas vezes pode ser usado no total (null = ilimitado)
    usage_limit_per_user integer DEFAULT 1, -- Vezes por usuário
    current_usage_count integer DEFAULT 0,
    
    -- Vigência
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    
    -- Status
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (discount_type IN ('percentage', 'fixed_amount')),
    CHECK (discount_value > 0),
    CHECK (usage_limit IS NULL OR usage_limit > 0),
    CHECK (usage_limit_per_user > 0),
    CHECK (current_usage_count >= 0),
    CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Índices para cupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.discount_coupons(valid_until);

-- RLS Policies para cupons
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.discount_coupons
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can view active coupons" ON public.discount_coupons
    FOR SELECT USING (is_active = true);

-- ====================================
-- 5. USO DE CUPONS (TRACKING)
-- ====================================
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id uuid REFERENCES public.discount_coupons(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_id uuid REFERENCES public.transactions(id),
    discount_applied decimal(10,2) NOT NULL,
    used_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (discount_applied >= 0),
    UNIQUE(coupon_id, user_id, transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);

-- RLS Policies para uso de cupons
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all coupon usage" ON public.coupon_usage
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
    FOR SELECT USING (auth.uid() = user_id);

-- ====================================
-- 6. CAMPANHAS PROMOCIONAIS
-- ====================================
CREATE TABLE IF NOT EXISTS public.promotional_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    campaign_type text NOT NULL, -- 'seasonal', 'launch', 'retention', 'win_back'
    
    -- Desconto da campanha
    discount_type text, -- 'percentage', 'fixed_amount', 'trial_period'
    discount_value decimal(10,2),
    trial_days integer, -- Para trial_period
    
    -- Alvo da campanha
    target_audience text[] DEFAULT '{}', -- 'new_users', 'existing_users', 'churned_users', 'specific_plan'
    target_plans text[] DEFAULT '{}', -- Planos específicos
    auto_apply boolean DEFAULT false, -- Aplicar automaticamente para usuários elegíveis
    
    -- Métricas
    goal_conversions integer, -- Meta de conversões
    current_conversions integer DEFAULT 0,
    total_revenue_generated decimal(10,2) DEFAULT 0,
    
    -- Vigência
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    
    -- Status
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CHECK (campaign_type IN ('seasonal', 'launch', 'retention', 'win_back')),
    CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed_amount', 'trial_period')),
    CHECK (end_date > start_date),
    CHECK (current_conversions >= 0),
    CHECK (total_revenue_generated >= 0)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.promotional_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.promotional_campaigns(start_date, end_date);

-- RLS Policies para campanhas
ALTER TABLE public.promotional_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON public.promotional_campaigns
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can view active campaigns" ON public.promotional_campaigns
    FOR SELECT USING (
        is_active = true 
        AND start_date <= now() 
        AND end_date >= now()
    );

-- ====================================
-- 7. PARTICIPAÇÃO EM CAMPANHAS
-- ====================================
CREATE TABLE IF NOT EXISTS public.campaign_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES public.promotional_campaigns(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    converted boolean DEFAULT false,
    converted_at timestamp with time zone,
    revenue_generated decimal(10,2),
    
    CHECK (revenue_generated IS NULL OR revenue_generated >= 0),
    UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON public.campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON public.campaign_participants(user_id);

-- RLS Policies para participantes
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all participants" ON public.campaign_participants
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can view own participation" ON public.campaign_participants
    FOR SELECT USING (auth.uid() = user_id);

-- ====================================
-- TRIGGERS PARA MÉTRICAS AUTOMÁTICAS
-- ====================================

-- Trigger: Incrementar contador de uso de cupom
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discount_coupons 
    SET current_usage_count = current_usage_count + 1,
        updated_at = now()
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_coupon_usage ON public.coupon_usage;
CREATE TRIGGER increment_coupon_usage
    AFTER INSERT ON public.coupon_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_usage_count();

-- Trigger: Atualizar métricas de campanha
CREATE OR REPLACE FUNCTION update_campaign_conversions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.converted = true AND (OLD IS NULL OR OLD.converted = false) THEN
        UPDATE promotional_campaigns
        SET current_conversions = current_conversions + 1,
            total_revenue_generated = total_revenue_generated + COALESCE(NEW.revenue_generated, 0),
            updated_at = now()
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_campaign_conversions ON public.campaign_participants;
CREATE TRIGGER increment_campaign_conversions
    AFTER INSERT OR UPDATE ON public.campaign_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_conversions();

-- Trigger: Atualizar updated_at em plan_config
CREATE OR REPLACE FUNCTION update_plan_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plan_config_timestamp_trigger ON public.plan_config;
CREATE TRIGGER update_plan_config_timestamp_trigger
    BEFORE UPDATE ON public.plan_config
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_config_timestamp();

-- ====================================
-- FUNÇÕES AUXILIARES
-- ====================================

-- Função: Validar se cupom pode ser usado
CREATE OR REPLACE FUNCTION validate_coupon(
    p_code text,
    p_user_id uuid,
    p_plan_tier text,
    p_amount decimal
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon record;
    v_usage_count integer;
    v_result jsonb;
BEGIN
    -- Buscar cupom
    SELECT * INTO v_coupon
    FROM discount_coupons
    WHERE code = p_code AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom não encontrado ou inativo');
    END IF;
    
    -- Verificar datas
    IF v_coupon.valid_from IS NOT NULL AND now() < v_coupon.valid_from THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom ainda não válido');
    END IF;
    
    IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom expirado');
    END IF;
    
    -- Verificar limite total
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.current_usage_count >= v_coupon.usage_limit THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom esgotado');
    END IF;
    
    -- Verificar limite por usuário
    SELECT COUNT(*) INTO v_usage_count
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    
    IF v_usage_count >= v_coupon.usage_limit_per_user THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Você já usou este cupom o máximo de vezes permitido');
    END IF;
    
    -- Verificar planos aplicáveis
    IF v_coupon.applicable_plans IS NOT NULL AND NOT (p_plan_tier = ANY(v_coupon.applicable_plans)) THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom não aplicável a este plano');
    END IF;
    
    -- Verificar valor mínimo
    IF v_coupon.min_purchase_amount IS NOT NULL AND p_amount < v_coupon.min_purchase_amount THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Valor mínimo não atingido');
    END IF;
    
    -- Calcular desconto
    DECLARE
        v_discount decimal;
    BEGIN
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := p_amount * (v_coupon.discount_value / 100);
            IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
                v_discount := v_coupon.max_discount_amount;
            END IF;
        ELSE
            v_discount := v_coupon.discount_value;
        END IF;
        
        RETURN jsonb_build_object(
            'valid', true,
            'discount', v_discount,
            'coupon_id', v_coupon.id,
            'coupon_name', v_coupon.name
        );
    END;
END;
$$;

-- ====================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================

COMMENT ON TABLE subscription_history IS 'Histórico de mudanças de plano dos usuários';
COMMENT ON TABLE transactions IS 'Transações financeiras (simuladas antes de integração com gateway)';
COMMENT ON TABLE plan_config IS 'Configuração dos planos disponíveis';
COMMENT ON TABLE discount_coupons IS 'Cupons de desconto configuráveis';
COMMENT ON TABLE coupon_usage IS 'Tracking de uso de cupons por usuário';
COMMENT ON TABLE promotional_campaigns IS 'Campanhas promocionais e ofertas especiais';
COMMENT ON TABLE campaign_participants IS 'Usuários inscritos em campanhas';

-- ====================================
-- FIM DO SCHEMA FINANCEIRO
-- ====================================
