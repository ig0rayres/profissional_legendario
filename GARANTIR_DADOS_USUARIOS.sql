-- =============================================
-- GARANTIR QUE TODOS USUÁRIOS TENHAM SUBSCRIPTION E GAMIFICATION
-- =============================================

-- 1. Criar subscriptions para usuários que não têm
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT 
    au.id,
    'recruta',
    'active'
FROM auth.users au
LEFT JOIN public.subscriptions s ON s.user_id = au.id
WHERE s.user_id IS NULL;

-- 2. Criar gamification para usuários que não têm
INSERT INTO public.user_gamification (user_id, current_rank_id, total_points, total_medals)
SELECT 
    au.id,
    'novato',
    0,
    0
FROM auth.users au
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
WHERE ug.user_id IS NULL;

-- 3. Verificar quantos foram criados
SELECT 
    COUNT(*) FILTER (WHERE s.user_id IS NOT NULL) as com_subscription,
    COUNT(*) FILTER (WHERE s.user_id IS NULL) as sem_subscription,
    COUNT(*) FILTER (WHERE ug.user_id IS NOT NULL) as com_gamification,
    COUNT(*) FILTER (WHERE ug.user_id IS NULL) as sem_gamification
FROM auth.users au
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id;

-- 4. Ver todos usuários com seus dados
SELECT 
    p.email,
    p.full_name,
    s.plan_id as plano,
    ug.current_rank_id as patente,
    ug.total_points as vigor
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.user_gamification ug ON ug.user_id = p.id
ORDER BY p.created_at DESC;
