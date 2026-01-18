-- VER NOMES DOS USUÁRIOS PARCEIROS
-- Execute no Supabase SQL Editor

-- Ver todos os profiles
SELECT id, full_name, email FROM profiles;

-- Ver especificamente os envolvidos nas confrarias
SELECT 
    ci.sender_id,
    ci.receiver_id,
    s.full_name as sender_name,
    r.full_name as receiver_name
FROM confraternity_invites ci
LEFT JOIN profiles s ON s.id = ci.sender_id
LEFT JOIN profiles r ON r.id = ci.receiver_id
WHERE ci.status = 'accepted';
