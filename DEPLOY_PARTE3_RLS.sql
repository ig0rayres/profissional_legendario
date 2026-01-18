-- ============================================================================
-- DEPLOY PARTE 3 (REVISADO) - SEM MESSAGES
-- ============================================================================

-- USER_CONNECTIONS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their connections" ON user_connections;
CREATE POLICY "Users can view their connections"
ON user_connections FOR SELECT
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "Users can create connections" ON user_connections;
CREATE POLICY "Users can create connections"
ON user_connections FOR INSERT
WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can update connections" ON user_connections;
CREATE POLICY "Users can update connections"
ON user_connections FOR UPDATE
USING (addressee_id = auth.uid() OR requester_id = auth.uid());

-- CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

-- PRAYER_REQUESTS
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view prayers" ON prayer_requests;
CREATE POLICY "Users can view prayers"
ON prayer_requests FOR SELECT
USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create prayers" ON prayer_requests;
CREATE POLICY "Users can create prayers"
ON prayer_requests FOR INSERT
WITH CHECK (from_user_id = auth.uid());

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects" ON projects;
CREATE POLICY "Users can view projects"
ON projects FOR SELECT
USING (professional_id = auth.uid() OR client_id = auth.uid());

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (professional_id = auth.uid() OR client_id = auth.uid());

DROP POLICY IF EXISTS "Users can update projects" ON projects;
CREATE POLICY "Users can update projects"
ON projects FOR UPDATE
USING (professional_id = auth.uid());

-- USER_ACTIVITIES
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activities" ON user_activities;
CREATE POLICY "Users can view activities"
ON user_activities FOR SELECT
USING (true);

DROP POLICY IF EXISTS "System can create activities" ON user_activities;
CREATE POLICY "System can create activities"
ON user_activities FOR INSERT
WITH CHECK (user_id = auth.uid());

SELECT 'PARTE 3 CONCLUIDA!' AS status;
