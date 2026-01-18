-- DEBUG CONFRARIA - VERIFICAR DADOS
-- Execute no Supabase SQL Editor

-- 1. Ver convites de confraria enviados
SELECT ci.*, 
       s.full_name as sender_name, 
       r.full_name as receiver_name
FROM confraternity_invites ci
LEFT JOIN profiles s ON s.id = ci.sender_id
LEFT JOIN profiles r ON r.id = ci.receiver_id
ORDER BY ci.created_at DESC
LIMIT 10;

-- 2. Ver notificações de confraria
SELECT * FROM notifications 
WHERE type = 'confraternity_invite'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Ver XP do usuário Elite
SELECT ug.*, p.full_name 
FROM user_gamification ug
JOIN profiles p ON p.id = ug.user_id
WHERE p.full_name LIKE '%Elite%';

-- 4. Ver todas as notificações do Recruta
SELECT n.*, p.full_name 
FROM notifications n
JOIN profiles p ON p.id = n.user_id
WHERE p.full_name LIKE '%Recruta%'
ORDER BY n.created_at DESC;
