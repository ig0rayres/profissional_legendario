-- =============================================
-- VERIFICAR RLS DA TABELA PROFILES
-- =============================================

-- 1. Ver se RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'subscriptions', 'user_gamification');

-- 2. Ver políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'subscriptions', 'user_gamification')
ORDER BY tablename, policyname;

-- 3. DESABILITAR RLS temporariamente para teste (CUIDADO!)
-- Descomente apenas se quiser testar
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_gamification DISABLE ROW LEVEL SECURITY;
