-- ============================================================================
-- DEPLOY SISTEMA SOCIAL - PARTE 2: FUNCTIONS E RLS
-- Execute após a PARTE 1
-- ============================================================================

-- Function: Verificar se pode criar confraria
CREATE OR REPLACE FUNCTION can_create_confraternity(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_count_this_month INT;
BEGIN
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN v_plan_id := 'recruta'; END IF;
  
  SELECT max_confraternities_per_month INTO v_max_allowed
  FROM plan_tiers WHERE id = v_plan_id;
  
  IF v_max_allowed IS NULL OR v_max_allowed = 0 THEN RETURN FALSE; END IF;
  
  SELECT COUNT(*) INTO v_count_this_month
  FROM confraternities
  WHERE created_by = p_user_id
  AND created_at >= date_trunc('month', CURRENT_DATE);
  
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
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN v_plan_id := 'recruta'; END IF;
  
  SELECT max_connections INTO v_max_allowed
  FROM plan_tiers WHERE id = v_plan_id;
  
  IF v_max_allowed IS NULL THEN RETURN TRUE; END IF;
  
  SELECT COUNT(*) INTO v_current_count
  FROM user_connections
  WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
  AND status = 'accepted';
  
  RETURN v_current_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verificar se pode criar anúncio
CREATE OR REPLACE FUNCTION can_create_marketplace_listing(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_active_count INT;
BEGIN
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN v_plan_id := 'recruta'; END IF;
  
  SELECT max_marketplace_listings INTO v_max_allowed
  FROM plan_tiers WHERE id = v_plan_id;
  
  IF v_max_allowed IS NULL OR v_max_allowed = 0 THEN RETURN FALSE; END IF;
  
  SELECT COUNT(*) INTO v_active_count
  FROM marketplace_listings
  WHERE seller_id = p_user_id AND status = 'active';
  
  RETURN v_active_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obter limites do usuário
CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_plan_id TEXT;
  v_result JSON;
BEGIN
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN v_plan_id := 'recruta'; END IF;
  
  SELECT json_build_object(
    'plan_id', v_plan_id,
    'plan_name', pt.name,
    'confraternities', json_build_object(
      'max', pt.max_confraternities_per_month,
      'used', (SELECT COUNT(*) FROM confraternities WHERE created_by = p_user_id AND created_at >= date_trunc('month', CURRENT_DATE)),
      'can_create', can_create_confraternity(p_user_id)
    ),
    'connections', json_build_object(
      'max', pt.max_connections,
      'used', (SELECT COUNT(*) FROM user_connections WHERE (requester_id = p_user_id OR addressee_id = p_user_id) AND status = 'accepted'),
      'can_add', can_add_connection(p_user_id)
    ),
    'marketplace', json_build_object(
      'max', pt.max_marketplace_listings,
      'used', (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = p_user_id AND status = 'active'),
      'can_create', can_create_marketplace_listing(p_user_id)
    )
  ) INTO v_result
  FROM plan_tiers pt WHERE pt.id = v_plan_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'PARTE 2 CONCLUIDA - Functions criadas!' AS status;
