-- CORRIGIR RLS DE GAMIFICAÇÃO PARA PERMITIR UPDATE
-- Execute no Supabase SQL Editor

-- Remover política existente
DROP POLICY IF EXISTS "Anyone authenticated can update gamification" ON user_gamification;

-- Criar política que permite UPDATE com USING e WITH CHECK
CREATE POLICY "Anyone authenticated can update gamification"
ON user_gamification FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename = 'user_gamification';
