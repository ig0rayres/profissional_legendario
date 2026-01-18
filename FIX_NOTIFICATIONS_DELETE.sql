-- CORRIGIR RLS DELETE NOTIFICATIONS
-- Execute no Supabase SQL Editor

-- Ver políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- Permitir delete para o próprio usuário
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Verificar novamente
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'notifications';
