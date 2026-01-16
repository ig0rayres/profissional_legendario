-- =============================================
-- VERIFICAR NOVO USUÁRIO CADASTRADO
-- =============================================
-- Execute depois de criar um novo usuário via /auth/register

-- 1. Ver o usuário mais recente
SELECT 
    au.email,
    au.created_at,
    au.email_confirmed_at,
    p.full_name,
    p.role,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 1;

-- 2. Verificar se TODOS os dados foram criados
SELECT 
    'Perfil criado?' as verificacao,
    CASE WHEN p.id IS NOT NULL THEN '✅ SIM' ELSE '❌ NÃO' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 1

UNION ALL

SELECT 
    'Subscription criada?' as verificacao,
    CASE WHEN s.user_id IS NOT NULL THEN '✅ SIM' ELSE '❌ NÃO' END as status
FROM auth.users au
LEFT JOIN public.subscriptions s ON s.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 1

UNION ALL

SELECT 
    'Gamification criada?' as verificacao,
    CASE WHEN ug.user_id IS NOT NULL THEN '✅ SIM' ELSE '❌ NÃO' END as status
FROM auth.users au
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 1;

-- 3. Valores esperados
-- ✅ Plano: 'recruta'
-- ✅ Rank: 'novato'
-- ✅ Pontos: 0
-- ✅ Medalhas: 0
