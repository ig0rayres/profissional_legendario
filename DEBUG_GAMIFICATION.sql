-- 1. Verificar estrutura da tabela user_gamification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_gamification';

-- 2. Verificar todos os registros de user_gamification
SELECT 
    ug.user_id,
    p.full_name,
    ug.total_points,
    ug.current_rank_id,
    ug.monthly_vigor
FROM user_gamification ug
JOIN profiles p ON ug.user_id = p.id;

-- 3. Verificar usuários SEM registro em user_gamification
SELECT p.id, p.full_name, p.email
FROM profiles p
LEFT JOIN user_gamification ug ON p.id = ug.user_id
WHERE ug.user_id IS NULL;

-- 4. Verificar convites aceitos
SELECT 
    ci.id,
    ci.status,
    ci.receiver_id,
    p.full_name as receiver_name,
    ci.accepted_at
FROM confraternity_invites ci
JOIN profiles p ON ci.receiver_id = p.id
WHERE ci.status = 'accepted'
ORDER BY ci.accepted_at DESC;

-- 5. Verificar medalhas do usuário Elite_Mod
SELECT 
    ub.user_id,
    p.full_name,
    ub.badge_id,
    b.name as badge_name,
    ub.earned_at
FROM user_badges ub
JOIN profiles p ON ub.user_id = p.id
JOIN badges b ON ub.badge_id = b.id
WHERE p.full_name ILIKE '%elite%'
ORDER BY ub.earned_at DESC;

-- 6. Verificar RLS policies em user_gamification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_gamification';
