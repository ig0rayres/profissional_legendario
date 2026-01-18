-- VERIFICAR CONFRARIAS ACEITAS
-- Execute no Supabase SQL Editor

-- Ver todas as confrarias aceitas
SELECT 
    ci.id,
    ci.status,
    ci.proposed_date,
    ci.location,
    s.full_name as sender_name,
    r.full_name as receiver_name
FROM confraternity_invites ci
LEFT JOIN profiles s ON s.id = ci.sender_id
LEFT JOIN profiles r ON r.id = ci.receiver_id
WHERE ci.status = 'accepted'
ORDER BY ci.proposed_date;

-- Ver se há confrarias futuras
SELECT 
    ci.id,
    ci.proposed_date,
    ci.proposed_date > NOW() as is_future
FROM confraternity_invites ci
WHERE ci.status = 'accepted';
