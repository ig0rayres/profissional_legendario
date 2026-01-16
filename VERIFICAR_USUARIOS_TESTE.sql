-- Verificar se os usuários de teste existem e têm subscription/gamification
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.user_gamification ug ON ug.user_id = p.id
WHERE p.email LIKE '%rota%'
ORDER BY p.created_at DESC;
