-- VERIFICAR NOTIFICAÇÕES DE LEMBRETE
-- Execute no Supabase SQL Editor

SELECT 
    n.id,
    n.user_id,
    p.full_name,
    n.type,
    n.title,
    n.body,
    n.created_at
FROM notifications n
LEFT JOIN profiles p ON p.id = n.user_id
WHERE n.type = 'confraternity_reminder'
ORDER BY n.created_at DESC;

-- Ver todas as notificações recentes
SELECT type, title, created_at FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
