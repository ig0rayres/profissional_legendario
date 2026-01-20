-- =====================================================
-- CORRIGIR RLS PARA INSERT EM user_gamification
-- Execute no Supabase SQL Editor
-- =====================================================

-- Ver políticas atuais
SELECT 'Políticas ANTES:' as info;
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'user_gamification';

-- Adicionar política de INSERT que estava faltando!
DROP POLICY IF EXISTS "Anyone authenticated can insert gamification" ON user_gamification;
CREATE POLICY "Anyone authenticated can insert gamification"
ON user_gamification FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verificar políticas depois
SELECT 'Políticas DEPOIS:' as info;
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'user_gamification';

-- Verificar se RLS está habilitado
SELECT 'RLS Status:' as info;
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'user_gamification';

SELECT '✅ PRONTO! Agora o sistema pode criar registros de gamificação.' as resultado;
