-- ADICIONAR POLÍTICA DE DELETE PARA CONEXÕES
-- Execute no Supabase SQL Editor

-- Política para permitir que usuários deletem suas próprias conexões
DROP POLICY IF EXISTS "Users can delete their connections" ON user_connections;

CREATE POLICY "Users can delete their connections" ON user_connections
    FOR DELETE USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- Verificar políticas
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'user_connections';
