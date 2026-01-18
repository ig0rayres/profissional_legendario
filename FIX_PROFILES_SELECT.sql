-- VERIFICAR E CORRIGIR RLS DE PROFILES
-- Execute no Supabase SQL Editor

-- Ver políticas atuais de profiles
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Verificar se RLS está habilitado
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';

-- Criar política para permitir SELECT público em profiles (se não existir)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Verificar novamente
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
