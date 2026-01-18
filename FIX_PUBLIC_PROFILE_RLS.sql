-- CORRIGIR RLS PARA VISUALIZAÇÃO PÚBLICA DE ELOS E CONFRARIAS
-- Execute no Supabase SQL Editor

-- 1. Permitir leitura pública de conexões aceitas
DROP POLICY IF EXISTS "Anyone can view accepted connections" ON user_connections;
CREATE POLICY "Anyone can view accepted connections"
ON user_connections FOR SELECT
TO authenticated
USING (status = 'accepted');

-- 2. Permitir leitura pública de confrarias aceitas (para exibir no perfil)
DROP POLICY IF EXISTS "Anyone can view accepted confraternities" ON confraternity_invites;
CREATE POLICY "Anyone can view accepted confraternities"
ON confraternity_invites FOR SELECT
TO authenticated
USING (status = 'accepted');

-- 3. Manter política para próprias confrarias (pendentes, etc)
DROP POLICY IF EXISTS "Users can view own confraternities" ON confraternity_invites;
CREATE POLICY "Users can view own confraternities"
ON confraternity_invites FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 4. Verificar políticas
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('user_connections', 'confraternity_invites')
ORDER BY tablename, policyname;
