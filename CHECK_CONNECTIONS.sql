-- Verificar conexões do usuário Recruta
SELECT 
    uc.*,
    p1.full_name as requester_name,
    p2.full_name as addressee_name
FROM user_connections uc
LEFT JOIN profiles p1 ON p1.id = uc.requester_id
LEFT JOIN profiles p2 ON p2.id = uc.addressee_id
WHERE uc.requester_id IN (SELECT id FROM profiles WHERE full_name ILIKE '%recruta%')
   OR uc.addressee_id IN (SELECT id FROM profiles WHERE full_name ILIKE '%recruta%');

-- Listar todas as conexões
SELECT 
    uc.id,
    uc.status,
    p1.full_name as de,
    p2.full_name as para,
    uc.created_at
FROM user_connections uc
LEFT JOIN profiles p1 ON p1.id = uc.requester_id
LEFT JOIN profiles p2 ON p2.id = uc.addressee_id
ORDER BY uc.created_at DESC
LIMIT 20;
