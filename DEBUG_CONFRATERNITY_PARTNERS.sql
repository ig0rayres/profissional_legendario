-- DEBUG CONFRARIAS COM PARCEIROS
-- Execute no Supabase SQL Editor

-- Ver confrarias com dados dos parceiros
SELECT 
    ci.id,
    ci.sender_id,
    ci.receiver_id,
    s.full_name as sender_name,
    r.full_name as receiver_name,
    ci.proposed_date,
    ci.location,
    ci.status
FROM confraternity_invites ci
LEFT JOIN profiles s ON s.id = ci.sender_id
LEFT JOIN profiles r ON r.id = ci.receiver_id
WHERE ci.status = 'accepted'
ORDER BY ci.proposed_date;

-- Ver colunas da tabela profiles
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
