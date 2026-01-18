-- VERIFICAR CONEXÕES EXISTENTES
-- Execute no Supabase SQL Editor

SELECT 
    uc.id,
    uc.status,
    uc.created_at,
    p1.full_name as requester,
    p2.full_name as addressee
FROM user_connections uc
JOIN profiles p1 ON p1.id = uc.requester_id
JOIN profiles p2 ON p2.id = uc.addressee_id
ORDER BY uc.created_at DESC;

-- Se quiser limpar as conexões para testar:
-- DELETE FROM user_connections;
