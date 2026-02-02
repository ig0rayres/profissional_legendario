-- ============================================
-- GESTÃO AUTOMÁTICA DE TEMPORADAS
-- ============================================
-- Função para resetar pontos mensais
-- Chamada automaticamente pelo cron no início de cada mês
--
-- O QUE ZERA:
-- - monthly_vigor (pontos do mês atual)
--
-- O QUE NÃO ZERA:
-- - total_points (XP permanente)
-- - user_medals (conquistas permanentes)
-- - user_proezas (histórico, apenas filtra por season_month)
-- ============================================

-- Função para zerar monthly_vigor de TODOS os usuários
CREATE OR REPLACE FUNCTION reset_monthly_vigor()
RETURNS TABLE(users_affected INTEGER, total_points_reset INTEGER) AS $$
DECLARE
    affected_count INTEGER;
    points_sum INTEGER;
BEGIN
    -- Somar total antes de zerar (para log)
    SELECT 
        COUNT(*),
        SUM(monthly_vigor)
    INTO affected_count, points_sum
    FROM user_gamification
    WHERE monthly_vigor > 0;
    
    -- Zerar monthly_vigor mantendo total_points
    UPDATE user_gamification
    SET 
        monthly_vigor = 0,
        updated_at = NOW()
    WHERE monthly_vigor > 0;
    
    -- Log
    RAISE NOTICE '✅ Reset mensal concluído:';
    RAISE NOTICE '   - % usuários afetados', affected_count;
    RAISE NOTICE '   - % pontos mensais zerados', points_sum;
    RAISE NOTICE '   - total_points permanece INTACTO';
    
    RETURN QUERY SELECT affected_count, COALESCE(points_sum, 0);
END;
$$ LANGUAGE plpgsql;

-- Comentário explicativo
COMMENT ON FUNCTION reset_monthly_vigor() IS 
'Zera monthly_vigor (pontos do mês) de todos os usuários. 
Medalhas (user_medals) permanecem intactas pois são conquistas permanentes.
total_points também permanece (XP acumulado vitalício).
user_proezas antigas permanecem como histórico (filtrar por season_month).';

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para filtrar proezas por temporada
CREATE INDEX IF NOT EXISTS idx_user_proezas_season_month 
ON user_proezas(user_id, season_month);

-- Índice para histórico de pontos por temporada
CREATE INDEX IF NOT EXISTS idx_points_history_season
ON points_history(user_id, ((metadata->>'season_month')::text));

-- Índice para buscar temporada ativa rapidamente
CREATE INDEX IF NOT EXISTS idx_seasons_status_dates
ON seasons(status, start_date, end_date);

-- ============================================
-- FUNÇÃO DE TESTE (Desenvolvimento)
-- ============================================

-- Função para testar reset sem executar de verdade
CREATE OR REPLACE FUNCTION preview_monthly_vigor_reset()
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    current_monthly_vigor INTEGER,
    will_be_reset BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ug.user_id,
        p.full_name,
        ug.monthly_vigor,
        (ug.monthly_vigor > 0) as will_be_reset
    FROM user_gamification ug
    LEFT JOIN profiles p ON p.id = ug.user_id
    WHERE ug.monthly_vigor > 0
    ORDER BY ug.monthly_vigor DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VALIDAÇÃO
-- ============================================

-- Testar em DEV primeiro:
-- SELECT * FROM preview_monthly_vigor_reset();
--
-- Executar reset:
-- SELECT * FROM reset_monthly_vigor();
--
-- Verificar:
-- SELECT user_id, monthly_vigor, total_points FROM user_gamification LIMIT 10;
