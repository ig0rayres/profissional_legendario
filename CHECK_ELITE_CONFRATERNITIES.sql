-- VER CONFRARIAS DO ELITE PARA 24H
-- Execute no Supabase SQL Editor

-- ID do Elite: ccdc0524-6803-4017-b08c-944785e14338
-- Hora atual: ~19:21 UTC (16:21 -03)
-- 24h depois: ~19:21 UTC amanhã

-- Confrarias aceitas do Elite
SELECT 
    ci.id,
    ci.proposed_date,
    ci.reminder_sent,
    ci.proposed_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours' as dentro_24h,
    s.full_name as sender,
    r.full_name as receiver
FROM confraternity_invites ci
JOIN profiles s ON s.id = ci.sender_id
JOIN profiles r ON r.id = ci.receiver_id
WHERE ci.status = 'accepted'
  AND (ci.sender_id = 'ccdc0524-6803-4017-b08c-944785e14338' 
       OR ci.receiver_id = 'ccdc0524-6803-4017-b08c-944785e14338');

-- Ver todas as confrarias aceitas
SELECT 
    id,
    proposed_date,
    reminder_sent,
    sender_id,
    receiver_id
FROM confraternity_invites 
WHERE status = 'accepted'
ORDER BY proposed_date;
