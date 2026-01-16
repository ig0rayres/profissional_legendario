-- =============================================
-- DIAGNÓSTICO COMPLETO DOS USUÁRIOS
-- =============================================

-- 1. Ver se existem em auth.users
SELECT 'AUTH.USERS' as tabela, COUNT(*) as total
FROM auth.users
WHERE email LIKE '%rotabusiness.com.br%';

-- 2. Ver se existem em profiles
SELECT 'PROFILES' as tabela, COUNT(*) as total
FROM public.profiles
WHERE email LIKE '%rotabusiness.com.br%';

-- 3. Details completos
SELECT 
    au.email,
    au.email_confirmed_at,
    p.id as profile_id,
    p.full_name,
    p.role,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
WHERE au.email LIKE '%rotabusiness.com.br%'
ORDER BY au.email;

-- 4. Criar profiles faltantes (se necessário)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    CASE 
        WHEN au.email LIKE 'recruta%' THEN 'Usuario Recruta'
        WHEN au.email LIKE 'veterano%' THEN 'Usuario Veterano'
        WHEN au.email LIKE 'elite%' THEN 'Usuario Elite'
        ELSE 'Usuario'
    END,
    'user'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email LIKE '%rotabusiness.com.br%'
  AND p.id IS NULL;

-- 5. Verificar quantos profiles foram criados
SELECT 
    COUNT(*) FILTER (WHERE p.id IS NOT NULL) as com_profile,
    COUNT(*) FILTER (WHERE p.id IS NULL) as sem_profile
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email LIKE '%rotabusiness.com.br%';
