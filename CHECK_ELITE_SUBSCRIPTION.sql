-- VERIFICAR SUBSCRIPTIONS DOS USUÁRIOS
-- Execute no Supabase SQL Editor

-- Ver todas as subscriptions
SELECT 
    us.user_id,
    us.plan_id,
    us.status,
    p.full_name
FROM user_subscriptions us
JOIN profiles p ON p.id = us.user_id;

-- Verificar se Usuario Elite tem subscription ativa
SELECT * FROM user_subscriptions 
WHERE user_id = (SELECT id FROM profiles WHERE full_name LIKE '%Elite%');

-- Se não tiver, criar:
-- INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
-- SELECT id, 'elite', 'active', NOW(), NOW() + INTERVAL '1 year'
-- FROM profiles WHERE full_name LIKE '%Elite%';
