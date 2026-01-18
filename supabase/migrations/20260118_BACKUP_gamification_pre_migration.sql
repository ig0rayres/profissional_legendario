-- ============================================================
-- 🔄 BACKUP SISTEMA DE GAMIFICAÇÃO - PRÉ-MIGRAÇÃO MENSAL
-- Rota Business Club
-- Data: 18 de Janeiro de 2026
-- ============================================================
-- 
-- Este script cria backups das tabelas atuais ANTES da migração
-- para o sistema mensal.
-- 
-- Execute este script ANTES de rodar:
-- 20260118_gamification_monthly_system.sql
-- ============================================================

-- ============================================================
-- PARTE 1: CRIAR TABELAS DE BACKUP
-- ============================================================

-- 1.1 Backup da tabela user_gamification
CREATE TABLE IF NOT EXISTS public.backup_user_gamification_20260118 AS
SELECT *, now() as backup_date
FROM public.user_gamification;

-- Comentário na tabela de backup
COMMENT ON TABLE public.backup_user_gamification_20260118 IS 
'Backup da tabela user_gamification criado em 18/01/2026 antes da migração para sistema mensal';

-- 1.2 Backup da tabela user_medals (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_medals') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS public.backup_user_medals_20260118 AS
                 SELECT *, now() as backup_date FROM public.user_medals';
        EXECUTE 'COMMENT ON TABLE public.backup_user_medals_20260118 IS 
                 ''Backup da tabela user_medals criado em 18/01/2026''';
        RAISE NOTICE '✅ Backup de user_medals criado';
    ELSE
        RAISE NOTICE '⏭️ Tabela user_medals não encontrada (pulando)';
    END IF;
END $$;

-- 1.3 Backup da tabela gamification_stats (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamification_stats') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS public.backup_gamification_stats_20260118 AS
                 SELECT *, now() as backup_date FROM public.gamification_stats';
        EXECUTE 'COMMENT ON TABLE public.backup_gamification_stats_20260118 IS 
                 ''Backup da tabela gamification_stats criado em 18/01/2026''';
        RAISE NOTICE '✅ Backup de gamification_stats criado';
    ELSE
        RAISE NOTICE '⏭️ Tabela gamification_stats não encontrada (pulando)';
    END IF;
END $$;

-- 1.4 Backup da tabela xp_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'xp_logs') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS public.backup_xp_logs_20260118 AS
                 SELECT *, now() as backup_date FROM public.xp_logs';
        EXECUTE 'COMMENT ON TABLE public.backup_xp_logs_20260118 IS 
                 ''Backup da tabela xp_logs criado em 18/01/2026''';
        RAISE NOTICE '✅ Backup de xp_logs criado';
    ELSE
        RAISE NOTICE '⏭️ Tabela xp_logs não encontrada (pulando)';
    END IF;
END $$;

-- 1.5 Backup da tabela user_badges (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS public.backup_user_badges_20260118 AS
                 SELECT *, now() as backup_date FROM public.user_badges';
        EXECUTE 'COMMENT ON TABLE public.backup_user_badges_20260118 IS 
                 ''Backup da tabela user_badges criado em 18/01/2026''';
        RAISE NOTICE '✅ Backup de user_badges criado';
    ELSE
        RAISE NOTICE '⏭️ Tabela user_badges não encontrada (pulando)';
    END IF;
END $$;

-- 1.6 Backup das subscriptions (para referência do plano)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS public.backup_subscriptions_20260118 AS
                 SELECT *, now() as backup_date FROM public.subscriptions';
        EXECUTE 'COMMENT ON TABLE public.backup_subscriptions_20260118 IS 
                 ''Backup da tabela subscriptions criado em 18/01/2026''';
        RAISE NOTICE '✅ Backup de subscriptions criado';
    ELSE
        RAISE NOTICE '⏭️ Tabela subscriptions não encontrada (pulando)';
    END IF;
END $$;

-- ============================================================
-- PARTE 2: VERIFICAÇÃO DO BACKUP
-- ============================================================

DO $$
DECLARE
    v_user_gam_count integer := 0;
    v_medals_count integer := 0;
    v_stats_count integer := 0;
    v_xp_logs_count integer := 0;
    v_badges_count integer := 0;
    v_subs_count integer := 0;
BEGIN
    -- Contar registros em cada backup
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_user_gamification_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_user_gamification_20260118' INTO v_user_gam_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_user_medals_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_user_medals_20260118' INTO v_medals_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_gamification_stats_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_gamification_stats_20260118' INTO v_stats_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_xp_logs_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_xp_logs_20260118' INTO v_xp_logs_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_user_badges_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_user_badges_20260118' INTO v_badges_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_subscriptions_20260118') THEN
        EXECUTE 'SELECT COUNT(*) FROM backup_subscriptions_20260118' INTO v_subs_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📦 RESUMO DO BACKUP - 18/01/2026';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '👥 user_gamification: % registros', v_user_gam_count;
    RAISE NOTICE '🏅 user_medals: % registros', v_medals_count;
    RAISE NOTICE '📊 gamification_stats: % registros', v_stats_count;
    RAISE NOTICE '📝 xp_logs: % registros', v_xp_logs_count;
    RAISE NOTICE '🎖️ user_badges: % registros', v_badges_count;
    RAISE NOTICE '💳 subscriptions: % registros', v_subs_count;
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ BACKUP CONCLUÍDO COM SUCESSO!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tabelas de backup criadas:';
    RAISE NOTICE '   - backup_user_gamification_20260118';
    RAISE NOTICE '   - backup_user_medals_20260118';
    RAISE NOTICE '   - backup_gamification_stats_20260118';
    RAISE NOTICE '   - backup_xp_logs_20260118';
    RAISE NOTICE '   - backup_user_badges_20260118';
    RAISE NOTICE '   - backup_subscriptions_20260118';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Para restaurar, execute:';
    RAISE NOTICE '   scripts/RESTORE_GAMIFICATION_BACKUP.sql';
    RAISE NOTICE '============================================================';
END $$;

-- ============================================================
-- PARTE 3: CRIAR SCRIPT DE RESTAURAÇÃO
-- ============================================================

-- Este comentário documenta como restaurar o backup:
/*
===================================================================
SCRIPT DE RESTAURAÇÃO (guardar para emergência)
===================================================================

-- 1. Dropar tabelas novas (se existirem)
DROP TABLE IF EXISTS public.user_season_badges CASCADE;
DROP TABLE IF EXISTS public.user_season_stats CASCADE;
DROP TABLE IF EXISTS public.gamification_seasons CASCADE;

-- 2. Restaurar dados das tabelas originais (se foram modificadas)
-- user_gamification
TRUNCATE TABLE public.user_gamification;
INSERT INTO public.user_gamification 
SELECT user_id, total_points, current_rank_id, total_xp, last_activity_at, created_at, updated_at
FROM public.backup_user_gamification_20260118;

-- gamification_stats (se existir)
TRUNCATE TABLE public.gamification_stats;
INSERT INTO public.gamification_stats 
SELECT user_id, total_xp, current_rank_id, season_xp, daily_xp_count, last_xp_date, updated_at
FROM public.backup_gamification_stats_20260118;

-- user_medals (se existir)
TRUNCATE TABLE public.user_medals;
INSERT INTO public.user_medals 
SELECT user_id, medal_id, earned_at
FROM public.backup_user_medals_20260118;

-- 3. Remover coluna season_id de xp_logs
ALTER TABLE public.xp_logs DROP COLUMN IF EXISTS season_id;

-- 4. Dropar funções novas
DROP FUNCTION IF EXISTS public.get_active_season();
DROP FUNCTION IF EXISTS public.add_season_xp(uuid, integer, text, text, jsonb);
DROP FUNCTION IF EXISTS public.check_season_rank_up(uuid, uuid);
DROP FUNCTION IF EXISTS public.award_season_badge(uuid, text);
DROP FUNCTION IF EXISTS public.start_new_season();
DROP FUNCTION IF EXISTS public.get_user_season_history(uuid, integer);
DROP FUNCTION IF EXISTS public.get_current_season_stats(uuid);
DROP FUNCTION IF EXISTS public.get_current_season_badges(uuid);

-- 5. Dropar view
DROP VIEW IF EXISTS public.v_current_season_ranking;

===================================================================
*/
