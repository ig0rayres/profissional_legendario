-- VERIFICAR RLS DA TABELA PROFILES
-- Execute no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. Ver políticas existentes
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Verificar se usuário consegue ler seu próprio profile
-- Substitua o UUID pelo ID de um usuário real
SELECT * FROM profiles WHERE id = 'efed140e-14e1-456c-b6df-643c974106a3';

-- 4. Verificar se profiles tem dados
SELECT id, full_name, email FROM profiles LIMIT 5;
