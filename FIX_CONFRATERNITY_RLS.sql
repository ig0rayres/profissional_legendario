-- CORRIGIR RLS PARA NOTIFICAÇÕES E GAMIFICAÇÃO
-- Execute no Supabase SQL Editor

-- ===========================================
-- NOTIFICAÇÕES
-- ===========================================

-- Ver políticas atuais da tabela notifications
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- Remover políticas existentes de INSERT
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;

-- Criar política que permite inserir notificações para QUALQUER usuário
-- (o sistema precisa poder notificar outros usuários)
CREATE POLICY "Anyone authenticated can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar política que permite ler suas próprias notificações
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Criar política que permite atualizar suas próprias notificações (marcar como lida)
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ===========================================
-- GAMIFICAÇÃO (user_gamification)
-- ===========================================

-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'user_gamification';

-- Remover políticas de UPDATE restritivas
DROP POLICY IF EXISTS "Users can update own gamification" ON user_gamification;
DROP POLICY IF EXISTS "user_gamification_update" ON user_gamification;

-- Criar política que permite UPDATE para qualquer usuário autenticado
-- (o sistema precisa poder atualizar pontos de outros usuários quando ações são feitas)
CREATE POLICY "Anyone authenticated can update gamification"
ON user_gamification FOR UPDATE
TO authenticated
WITH CHECK (true);

-- Garantir SELECT funciona
DROP POLICY IF EXISTS "Anyone can view gamification" ON user_gamification;
CREATE POLICY "Anyone can view gamification"
ON user_gamification FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- VERIFICAR CONFRATERNITY_INVITES
-- ===========================================

-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'confraternity_invites';

-- Permitir inserir convites
DROP POLICY IF EXISTS "Users can insert confraternity invites" ON confraternity_invites;
CREATE POLICY "Users can insert confraternity invites"
ON confraternity_invites FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Permitir ver convites onde você é sender ou receiver
DROP POLICY IF EXISTS "Users can view relevant invites" ON confraternity_invites;
CREATE POLICY "Users can view relevant invites"
ON confraternity_invites FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Permitir atualizar convites onde você é receiver (aceitar/recusar)
DROP POLICY IF EXISTS "Users can update received invites" ON confraternity_invites;
CREATE POLICY "Users can update received invites"
ON confraternity_invites FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid() OR sender_id = auth.uid());

-- ===========================================
-- VERIFICAR
-- ===========================================

SELECT 'Políticas atualizadas!' as status;

-- Listar todas as políticas após mudanças
SELECT tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename IN ('notifications', 'user_gamification', 'confraternity_invites')
ORDER BY tablename, policyname;
