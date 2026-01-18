-- FIX RLS PARA SISTEMA SOCIAL
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. USER_CONNECTIONS (Elos)
-- ========================================
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their connections" ON user_connections;
DROP POLICY IF EXISTS "Users can create connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update their connections" ON user_connections;

-- Usuário pode ver suas conexões (enviadas ou recebidas)
CREATE POLICY "Users can view their connections" ON user_connections
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- Usuário pode criar conexões (enviar solicitação)
CREATE POLICY "Users can create connections" ON user_connections
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id
    );

-- Usuário pode atualizar conexões recebidas (aceitar/recusar)
CREATE POLICY "Users can update received connections" ON user_connections
    FOR UPDATE USING (
        auth.uid() = addressee_id
    );

-- ========================================
-- 2. CONVERSATIONS (Conversas)
-- ========================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- ========================================
-- 3. MESSAGES (Mensagens)
-- ========================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- ========================================
-- 4. PRAYER_REQUESTS (Orações)
-- ========================================
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view prayers" ON prayer_requests;
DROP POLICY IF EXISTS "Users can send prayers" ON prayer_requests;

CREATE POLICY "Users can view their prayers" ON prayer_requests
    FOR SELECT USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

CREATE POLICY "Users can send prayers" ON prayer_requests
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id
    );

-- ========================================
-- 5. PROJECTS (Projetos)
-- ========================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;

CREATE POLICY "Users can view their projects" ON projects
    FOR SELECT USING (
        auth.uid() = client_id OR auth.uid() = professional_id
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (
        auth.uid() = client_id
    );

CREATE POLICY "Professionals can update their projects" ON projects
    FOR UPDATE USING (
        auth.uid() = professional_id
    );

-- ========================================
-- VERIFICAR
-- ========================================
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('user_connections', 'conversations', 'messages', 'prayer_requests', 'projects')
ORDER BY tablename, policyname;
