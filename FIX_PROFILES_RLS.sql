-- VERIFICAR E CORRIGIR RLS DA TABELA PROFILES
-- Execute no Supabase SQL Editor

-- 1. Ver políticas existentes
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- 2. Garantir que usuário pode ler seu próprio profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 3. Garantir que todos podem ler profiles básicos (para listagem)
DROP POLICY IF EXISTS "Anyone can read basic profile info" ON profiles;
CREATE POLICY "Anyone can read basic profile info" ON profiles
    FOR SELECT USING (true);

-- 4. Verificar se RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
