-- ============================================
-- TESTE RÁPIDO - SISTEMA DE GAMIFICAÇÃO
-- Execute este script para testar TUDO
-- Tempo estimado: 30 segundos
-- ============================================

-- ====== TESTE 1: Verificar se tabelas existem ======
DO $$
BEGIN
    RAISE NOTICE '====== TESTE 1: TABELAS ======';
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'ranks') THEN
        RAISE NOTICE '✅ Tabela ranks existe';
    ELSE
        RAISE NOTICE '❌ Tabela ranks NÃO existe - Execute deploy_gamification_SIMPLE.sql';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'badges') THEN
        RAISE NOTICE '✅ Tabela badges existe';
    ELSE
        RAISE NOTICE '❌ Tabela badges NÃO existe';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'gamification_stats') THEN
        RAISE NOTICE '✅ Tabela gamification_stats existe';
    ELSE
        RAISE NOTICE '❌ Tabela gamification_stats NÃO existe';
    END IF;
END $$;

-- ====== TESTE 2: Contar registros ======
DO $$
DECLARE
    v_ranks int;
    v_badges int;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TESTE 2: DADOS ======';
    
    SELECT COUNT(*) INTO v_ranks FROM ranks;
    SELECT COUNT(*) INTO v_badges FROM badges;
    
    RAISE NOTICE 'Ranks instalados: % (esperado: 6)', v_ranks;
    RAISE NOTICE 'Badges instaladas: % (esperado: 12)', v_badges;
    
    IF v_ranks = 6 AND v_badges = 12 THEN
        RAISE NOTICE '✅ DADOS OK';
    ELSE
        RAISE NOTICE '⚠️  Execute deploy_gamification_SIMPLE.sql';
    END IF;
END $$;

-- ====== TESTE 3: Testar função add_user_xp ======
DO $$
DECLARE
    v_xp_concedido int;
    v_test_user uuid := '99999999-0000-0000-0000-000000000001';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TESTE 3: FUNÇÃO add_user_xp ======';
    
    -- Limpar teste anterior
    DELETE FROM xp_logs WHERE user_id = v_test_user;
    DELETE FROM gamification_stats WHERE user_id = v_test_user;
    
    -- Testar função
    BEGIN
        SELECT add_user_xp(v_test_user, 100, 'test', 'Teste automático') INTO v_xp_concedido;
        RAISE NOTICE '✅ Função add_user_xp FUNCIONA';
        RAISE NOTICE '   Pontos concedidos: %', v_xp_concedido;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Função add_user_xp FALHOU: %', SQLERRM;
        RAISE NOTICE '   → Execute deploy_gamification_SIMPLE.sql';
    END;
END $$;

-- ====== TESTE 4: Testar função award_badge ======
DO $$
DECLARE
    v_badge_concedida boolean;
    v_test_user uuid := '99999999-0000-0000-0000-000000000001';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TESTE 4: FUNÇÃO award_badge ======';
    
    -- Limpar
    DELETE FROM user_badges WHERE user_id = v_test_user;
    
    -- Testar
    BEGIN
        SELECT award_badge(v_test_user, 'alistamento_concluido') INTO v_badge_concedida;
        RAISE NOTICE '✅ Função award_badge FUNCIONA';
        RAISE NOTICE '   Badge concedida: %', v_badge_concedida;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Função award_badge FALHOU: %', SQLERRM;
    END;
END $$;

-- ====== RESULTADO FINAL ======
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '📊 RESULTADO FINAL';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Se todos os testes passaram (✅):';
    RAISE NOTICE '  → Sistema PRONTO para uso!';
    RAISE NOTICE '  → Medalhas serão concedidas automaticamente';
    RAISE NOTICE '  → Pontos serão distribuídos';
    RAISE NOTICE '';
    RAISE NOTICE 'Se algum teste falhou (❌):';
    RAISE NOTICE '  → Execute deploy_gamification_SIMPLE.sql';
    RAISE NOTICE '  → Depois execute este teste novamente';
    RAISE NOTICE '============================================';
END $$;

-- Mostrar dados do usuário de teste
SELECT 'Dados do usuário de teste:' as info;
SELECT 
    user_id,
    total_xp,
    current_rank_id,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = '99999999-0000-0000-0000-000000000001') as badges
FROM gamification_stats
WHERE user_id = '99999999-0000-0000-0000-000000000001';
