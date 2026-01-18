-- ============================================================
-- 🔙 RESTAURAÇÃO DO BACKUP - SISTEMA DE GAMIFICAÇÃO
-- Rota Business Club
-- Data: 18 de Janeiro de 2026
-- ============================================================
-- 
-- ⚠️ CUIDADO: Este script REVERTE a migração para o sistema mensal!
-- 
-- Execute APENAS se houver problemas com a migração e precisar
-- voltar ao estado anterior.
-- ============================================================

-- ============================================================
-- PARTE 1: REMOVER ESTRUTURAS NOVAS
-- ============================================================

-- 1.1 Dropar view
DROP VIEW IF EXISTS public.v_current_season_ranking;

-- 1.2 Dropar tabelas novas (na ordem correta para evitar FK errors)
DROP TABLE IF EXISTS public.user_season_badges CASCADE;
DROP TABLE IF EXISTS public.user_season_stats CASCADE;
DROP TABLE IF EXISTS public.gamification_seasons CASCADE;

RAISE NOTICE '✅ Tabelas novas removidas';

-- ============================================================
-- PARTE 2: REMOVER FUNÇÕES NOVAS
-- ============================================================

DROP FUNCTION IF EXISTS public.get_active_season();
DROP FUNCTION IF EXISTS public.add_season_xp(uuid, integer, text, text, jsonb);
DROP FUNCTION IF EXISTS public.check_season_rank_up(uuid, uuid);
DROP FUNCTION IF EXISTS public.award_season_badge(uuid, text);
DROP FUNCTION IF EXISTS public.start_new_season();
DROP FUNCTION IF EXISTS public.get_user_season_history(uuid, integer);
DROP FUNCTION IF EXISTS public.get_current_season_stats(uuid);
DROP FUNCTION IF EXISTS public.get_current_season_badges(uuid);

RAISE NOTICE '✅ Funções novas removidas';

-- ============================================================
-- PARTE 3: REMOVER COLUNA SEASON_ID DE XP_LOGS
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'xp_logs' AND column_name = 'season_id'
    ) THEN
        ALTER TABLE public.xp_logs DROP COLUMN season_id;
        RAISE NOTICE '✅ Coluna season_id removida de xp_logs';
    ELSE
        RAISE NOTICE '⏭️ Coluna season_id não existe em xp_logs';
    END IF;
END $$;

-- ============================================================
-- PARTE 4: RESTAURAR DADOS DOS BACKUPS (SE NECESSÁRIO)
-- ============================================================

-- NOTA: Geralmente não é necessário restaurar dados pois as tabelas
-- originais não foram modificadas. Mas se precisar:

-- 4.1 Restaurar gamification_stats
/*
TRUNCATE TABLE public.gamification_stats;
INSERT INTO public.gamification_stats (user_id, total_xp, current_rank_id, season_xp, daily_xp_count, last_xp_date, updated_at)
SELECT user_id, total_xp, current_rank_id, season_xp, daily_xp_count, last_xp_date, updated_at
FROM public.backup_gamification_stats_20260118;
*/

-- 4.2 Restaurar user_gamification
/*
TRUNCATE TABLE public.user_gamification;
INSERT INTO public.user_gamification (user_id, total_points, current_rank_id, total_xp, last_activity_at, created_at, updated_at)
SELECT user_id, total_points, current_rank_id, total_xp, last_activity_at, created_at, updated_at
FROM public.backup_user_gamification_20260118;
*/

-- 4.3 Restaurar user_medals
/*
TRUNCATE TABLE public.user_medals;
INSERT INTO public.user_medals (user_id, medal_id, earned_at)
SELECT user_id, medal_id, earned_at
FROM public.backup_user_medals_20260118;
*/

-- ============================================================
-- PARTE 5: VERIFICAÇÃO
-- ============================================================

DO $$
DECLARE
    v_seasons_exists boolean;
    v_stats_exists boolean;
    v_badges_exists boolean;
    v_function_exists boolean;
BEGIN
    -- Verificar se tabelas novas foram removidas
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamification_seasons') INTO v_seasons_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_season_stats') INTO v_stats_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_season_badges') INTO v_badges_exists;
    SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'add_season_xp') INTO v_function_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '🔙 VERIFICAÇÃO DA RESTAURAÇÃO';
    RAISE NOTICE '============================================================';
    
    IF NOT v_seasons_exists AND NOT v_stats_exists AND NOT v_badges_exists AND NOT v_function_exists THEN
        RAISE NOTICE '✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '✅ Todas as estruturas novas foram removidas';
        RAISE NOTICE '✅ Sistema voltou ao estado anterior à migração';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: Algumas estruturas ainda existem:';
        IF v_seasons_exists THEN RAISE NOTICE '   - gamification_seasons ainda existe'; END IF;
        IF v_stats_exists THEN RAISE NOTICE '   - user_season_stats ainda existe'; END IF;
        IF v_badges_exists THEN RAISE NOTICE '   - user_season_badges ainda existe'; END IF;
        IF v_function_exists THEN RAISE NOTICE '   - add_season_xp ainda existe'; END IF;
    END IF;
    
    RAISE NOTICE '============================================================';
END $$;

-- ============================================================
-- PARTE 6: LIMPEZA DOS BACKUPS (OPCIONAL - EXECUTE APENAS QUANDO TIVER CERTEZA!)
-- ============================================================

/*
-- ⚠️ CUIDADO: Só execute isto quando tiver certeza de que não precisa mais dos backups!

DROP TABLE IF EXISTS public.backup_user_gamification_20260118;
DROP TABLE IF EXISTS public.backup_user_medals_20260118;
DROP TABLE IF EXISTS public.backup_gamification_stats_20260118;
DROP TABLE IF EXISTS public.backup_xp_logs_20260118;
DROP TABLE IF EXISTS public.backup_user_badges_20260118;
DROP TABLE IF EXISTS public.backup_subscriptions_20260118;

RAISE NOTICE '🗑️ Tabelas de backup removidas';
*/
