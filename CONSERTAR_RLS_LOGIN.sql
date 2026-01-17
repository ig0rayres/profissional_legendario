-- =============================================
-- VERIFICAR E CONSERTAR RLS - LOGIN
-- =============================================

-- 1. Ver políticas atuais da tabela profiles
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
WHERE tablename = 'profiles';

-- 2. GARANTIR que profiles pode ser lido por qualquer autenticado
DROP POLICY IF EXISTS "Profiles são visíveis para todos autenticados" ON public.profiles;

CREATE POLICY "Profiles são visíveis para todos autenticados"
ON public.profiles FOR SELECT
USING (true); -- Qualquer um pode ler

-- 3. Verificar se user_gamification está acessível
DROP POLICY IF EXISTS "Gamification visível para todos" ON public.user_gamification;

CREATE POLICY "Gamification visível para todos"
ON public.user_gamification FOR SELECT
USING (true);

-- 4. Verificar subscriptions
DROP POLICY IF EXISTS "Subscriptions visíveis para todos" ON public.subscriptions;

CREATE POLICY "Subscriptions visíveis para todos"
ON public.subscriptions FOR SELECT
USING (true);

-- 5. Testar query simples
SELECT 
    id,
    email,
    full_name
FROM profiles
WHERE email = 'admin@rotaclub.com';

-- Se retornar dados, RLS está OK
-- Se retornar vazio, há problema de RLS
