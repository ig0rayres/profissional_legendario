-- =============================================
-- RESET DE ELOS (USER_CONNECTIONS)
-- =============================================

-- Deletar TODAS as conexões
DELETE FROM user_connections;

-- Verificar que está vazio
SELECT COUNT(*) as total_elos FROM user_connections;

-- Confirmar
SELECT 'Todos os elos foram deletados!' as resultado;
