-- VERIFICAR DESTINATÁRIOS DOS LEMBRETES
-- Execute no Supabase SQL Editor

SELECT 
    n.id,
    n.user_id,
    p.full_name as para_usuario,
    n.type,
    n.title,
    n.read_at
FROM notifications n
LEFT JOIN profiles p ON p.id = n.user_id
WHERE n.type = 'confraternity_reminder'
ORDER BY n.created_at DESC;

-- Comparar com IDs dos usuários
SELECT id, full_name FROM profiles;
