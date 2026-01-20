-- =============================================
-- RESET NOTIFICAÇÕES DO USUARIO RECRUTA
-- =============================================

-- Ver ID do usuario recruta
SELECT id, full_name FROM profiles WHERE full_name ILIKE '%recruta%';

-- Deletar TODAS as notificações do usuario recruta
DELETE FROM notifications 
WHERE user_id = (SELECT id FROM profiles WHERE full_name ILIKE '%recruta%' LIMIT 1);

-- Verificar que foi limpo
SELECT COUNT(*) as notificacoes_restantes 
FROM notifications 
WHERE user_id = (SELECT id FROM profiles WHERE full_name ILIKE '%recruta%' LIMIT 1);

-- Se quiser limpar de TODOS os usuários:
-- DELETE FROM notifications;

SELECT 'Notificações resetadas!' as resultado;
