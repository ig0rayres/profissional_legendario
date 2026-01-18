-- ============================================================================
-- DEPLOY COMPLETO - SISTEMA SOCIAL E LIMITES DE PLANO
-- Data: 17/01/2026
-- Objetivo: Implementar Elo, Mensageria, Oração, Limites, etc.
-- ============================================================================

-- ============================================================================
-- 1. ATUALIZAR PLAN_TIERS COM LIMITES
-- ============================================================================

ALTER TABLE plan_tiers 
ADD COLUMN IF NOT EXISTS max_confraternities_per_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_connections INT, -- NULL = ilimitado
ADD COLUMN IF NOT EXISTS max_marketplace_listings INT DEFAULT 0;

-- Configurar limites por plano
UPDATE plan_tiers SET 
  max_confraternities_per_month = 0,
  max_connections = 10,
  max_marketplace_listings = 0
WHERE id = 'recruta';

UPDATE plan_tiers SET 
  max_confraternities_per_month = 4,
  max_connections = 100,
  max_marketplace_listings = 2
WHERE id = 'veterano';

UPDATE plan_tiers SET 
  max_confraternities_per_month = 10,
  max_connections = NULL, -- ilimitado
  max_marketplace_listings = 10
WHERE id = 'elite';

-- ============================================================================
-- 2. TABELA: SISTEMA DE ELO (AMIZADE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id) -- Não pode adicionar a si mesmo
);

CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee ON user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

COMMENT ON TABLE user_connections IS 'Sistema de Elo (amizade) entre usuários';

-- ============================================================================
-- 3. TABELA: MENSAGERIA (CONVERSAS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  UNIQUE(participant_1_id, participant_2_id),
  CHECK (participant_1_id < participant_2_id) -- Garantir ordem para evitar duplicatas
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_2_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 5000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read_at) WHERE read_at IS NULL;

COMMENT ON TABLE conversations IS 'Conversas entre usuários';
COMMENT ON TABLE messages IS 'Mensagens dentro de conversas';

-- ============================================================================
-- 4. TABELA: SISTEMA DE ORAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL CHECK (length(message) > 0 AND length(message) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_user_id != to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_to ON prayer_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_from ON prayer_requests(from_user_id);

COMMENT ON TABLE prayer_requests IS 'Pedidos de oração entre usuários';

-- ============================================================================
-- 5. TABELA: PROJETOS/SERVIÇOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_professional ON projects(professional_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

COMMENT ON TABLE projects IS 'Projetos/serviços realizados pelos profissionais';

-- ============================================================================
-- 6. TABELA: FEED DE ATIVIDADES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'medal_earned',
    'confraternity_created',
    'confraternity_attended',
    'project_completed',
    'connection_accepted',
    'rank_up'
  )),
  activity_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities(created_at DESC);

COMMENT ON TABLE user_activities IS 'Feed de atividades dos usuários para notificações sociais';

-- ============================================================================
-- 7. FUNCTIONS: VERIFICAÇÃO DE LIMITES
-- ============================================================================

-- Function: Verificar se pode criar confraria
CREATE OR REPLACE FUNCTION can_create_confraternity(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_count_this_month INT;
BEGIN
  -- Buscar plano do usuário
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta'; -- Default
  END IF;
  
  -- Buscar limite do plano
  SELECT max_confraternities_per_month INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  -- Se limite é 0, não pode criar
  IF v_max_allowed IS NULL OR v_max_allowed = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Contar confraternities criadas este mês
  SELECT COUNT(*) INTO v_count_this_month
  FROM confraternities
  WHERE created_by = p_user_id
  AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Verificar se ainda pode criar
  RETURN v_count_this_month < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verificar se pode adicionar elo
CREATE OR REPLACE FUNCTION can_add_connection(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_current_count INT;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limite
  SELECT max_connections INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  -- NULL = ilimitado
  IF v_max_allowed IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Contar elos aceitos
  SELECT COUNT(*) INTO v_current_count
  FROM user_connections
  WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
  AND status = 'accepted';
  
  RETURN v_current_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verificar se pode criar anúncio marketplace
CREATE OR REPLACE FUNCTION can_create_marketplace_listing(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_active_count INT;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limite
  SELECT max_marketplace_listings INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  IF v_max_allowed IS NULL OR v_max_allowed = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Contar anúncios ativos
  SELECT COUNT(*) INTO v_active_count
  FROM marketplace_listings
  WHERE seller_id = p_user_id
  AND status = 'active';
  
  RETURN v_active_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obter todos os limites do usuário
CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_plan_id TEXT;
  v_result JSON;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limites e uso atual
  SELECT json_build_object(
    'plan_id', v_plan_id,
    'plan_name', pt.name,
    'confraternities', json_build_object(
      'max', pt.max_confraternities_per_month,
      'used', (
        SELECT COUNT(*)
        FROM confraternities
        WHERE created_by = p_user_id
        AND created_at >= date_trunc('month', CURRENT_DATE)
      ),
      'can_create', can_create_confraternity(p_user_id)
    ),
    'connections', json_build_object(
      'max', pt.max_connections,
      'used', (
        SELECT COUNT(*)
        FROM user_connections
        WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
        AND status = 'accepted'
      ),
      'can_add', can_add_connection(p_user_id)
    ),
    'marketplace', json_build_object(
      'max', pt.max_marketplace_listings,
      'used', (
        SELECT COUNT(*)
        FROM marketplace_listings
        WHERE seller_id = p_user_id
        AND status = 'active'
      ),
      'can_create', can_create_marketplace_listing(p_user_id)
    )
  ) INTO v_result
  FROM plan_tiers pt
  WHERE pt.id = v_plan_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- USER_CONNECTIONS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
ON user_connections FOR SELECT
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create connections if within limits"
ON user_connections FOR INSERT
WITH CHECK (
  requester_id = auth.uid() 
  AND can_add_connection(auth.uid())
);

CREATE POLICY "Users can update their connection requests"
ON user_connections FOR UPDATE
USING (addressee_id = auth.uid() OR requester_id = auth.uid());

-- CONVERSATIONS & MESSAGES
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- PRAYER_REQUESTS
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prayers sent to them"
ON prayer_requests FOR SELECT
USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

CREATE POLICY "Users can create prayer requests"
ON prayer_requests FOR INSERT
WITH CHECK (from_user_id = auth.uid());

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their projects"
ON projects FOR SELECT
USING (professional_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Professionals can create projects"
ON projects FOR INSERT
WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update their projects"
ON projects FOR UPDATE
USING (professional_id = auth.uid());

-- USER_ACTIVITIES
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities of their connections"
ON user_activities FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_connections
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND addressee_id = user_activities.user_id)
      OR (addressee_id = auth.uid() AND requester_id = user_activities.user_id)
    )
  )
);

-- ============================================================================
-- FIM DO DEPLOY
-- ============================================================================

-- Verificar estrutura
SELECT 'Tabelas criadas com sucesso!' AS status;
