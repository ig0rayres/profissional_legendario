/* TESTE VISUAL - Retorna resultados em tabela */

/* PASSO 1: Verificar tabelas */
SELECT 
    'TABELAS' as categoria,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'ranks') THEN '✅ ranks'
        ELSE '❌ ranks FALTA'
    END as resultado_1,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'badges') THEN '✅ badges'
        ELSE '❌ badges FALTA'
    END as resultado_2,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'gamification_stats') THEN '✅ gamification_stats'
        ELSE '❌ gamification_stats FALTA'
    END as resultado_3;

-- PASSO 2: Contar dados
SELECT 
    'DADOS' as categoria,
    (SELECT COUNT(*)::text || ' ranks (esperado: 6)' FROM ranks) as resultado_1,
    (SELECT COUNT(*)::text || ' badges (esperado: 12)' FROM badges) as resultado_2,
    (SELECT COUNT(*)::text || ' usuários com stats' FROM gamification_stats) as resultado_3;

-- PASSO 3: Verificar funções existem
SELECT 
    'FUNÇÕES SQL' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'add_user_xp'
        ) THEN '✅ add_user_xp existe'
        ELSE '❌ add_user_xp NÃO existe - Execute deploy_gamification_SIMPLE.sql'
    END as resultado_1,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'award_badge'
        ) THEN '✅ award_badge existe'
        ELSE '❌ award_badge NÃO existe'
    END as resultado_2,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'check_rank_up'
        ) THEN '✅ check_rank_up existe'
        ELSE '❌ check_rank_up NÃO existe'
    END as resultado_3;

-- PASSO 4: Listar todas as badges instaladas
SELECT 
    id,
    name as nome,
    xp_reward as xp,
    criteria_type as tipo,
    CASE WHEN is_active THEN '✅ Ativa' ELSE '❌ Inativa' END as status
FROM badges
ORDER BY xp_reward DESC;
