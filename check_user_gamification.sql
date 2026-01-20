-- Verificar se o usuário Elite_mod tem registro em user_gamification
SELECT 
    p.id,
    p.full_name,
    ug.total_points,
    ug.current_rank_id
FROM profiles p
LEFT JOIN user_gamification ug ON p.id = ug.user_id
WHERE p.full_name ILIKE '%elite%' OR p.full_name ILIKE '%mod%';
