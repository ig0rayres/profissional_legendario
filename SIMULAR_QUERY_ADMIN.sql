-- =============================================
-- SIMULAR QUERY DO PAINEL ADMIN
-- =============================================

-- Esta é a MESMA query que o painel admin faz
SELECT 
    p.*,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points,
    ug.total_medals
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.user_gamification ug ON ug.user_id = p.id
WHERE p.email LIKE '%rotabusiness.com.br%'
ORDER BY p.created_at DESC;

-- Ver estrutura de retorno específica
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.verification_status,
    p.rota_number,
    p.created_at,
    -- subscriptions como objeto
    json_build_object('plan_id', s.plan_id) as subscriptions,
    -- user_gamification como objeto
    json_build_object(
        'current_rank_id', ug.current_rank_id,
        'total_points', ug.total_points,
        'total_medals', ug.total_medals
    ) as user_gamification
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.user_gamification ug ON ug.user_id = p.id
WHERE p.email LIKE '%rotabusiness.com.br%'
ORDER BY p.created_at DESC;
