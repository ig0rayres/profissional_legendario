/* Teste 2: Contar dados */
SELECT 
    'Ranks' as tipo,
    COUNT(*) as total,
    '6 esperados' as esperado
FROM ranks
UNION ALL
SELECT 
    'Badges' as tipo,
    COUNT(*) as total,
    '12 esperadas' as esperado
FROM badges
UNION ALL
SELECT 
    'Tabelas' as tipo,
    COUNT(*) as total,
    '5 esperadas' as esperado
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('ranks', 'badges', 'gamification_stats', 'xp_logs', 'user_badges');
