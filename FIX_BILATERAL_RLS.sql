-- FIX RLS BILATERAL PARA CONEXÕES
-- Execute no Supabase SQL Editor

-- Ver política atual
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_connections';

-- Recriar política de SELECT para permitir ver conexões em AMBAS direções
DROP POLICY IF EXISTS "Users can view their connections" ON user_connections;

CREATE POLICY "Users can view their connections" ON user_connections
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- Verificar se a política foi criada
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_connections';

-- Testar: Mostra todas as conexões (admin)
SELECT * FROM user_connections;
