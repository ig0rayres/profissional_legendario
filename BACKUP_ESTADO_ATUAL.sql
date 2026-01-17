-- =============================================
-- BACKUP COMPLETO DO ESTADO ATUAL
-- =============================================
-- Execute este script para salvar o estado antes de implementar triggers

-- =============================================
-- 1. BACKUP DE USUÁRIOS E GAMIFICAÇÃO
-- =============================================
-- Copie o resultado e salve em arquivo separado!

SELECT 'BACKUP - PROFILES' as tabela;
SELECT * FROM profiles ORDER BY created_at;

SELECT 'BACKUP - SUBSCRIPTIONS' as tabela;
SELECT * FROM subscriptions ORDER BY created_at;

SELECT 'BACKUP - USER_GAMIFICATION' as tabela;
SELECT * FROM user_gamification ORDER BY user_id;

SELECT 'BACKUP - USER_MEDALS' as tabela;
SELECT * FROM user_medals ORDER BY earned_at;

-- =============================================
-- 2. BACKUP DE CONFIGURAÇÕES
-- =============================================

SELECT 'BACKUP - RANKS' as tabela;
SELECT * FROM ranks ORDER BY rank_level;

SELECT 'BACKUP - MEDALS' as tabela;
SELECT * FROM medals ORDER BY id;

SELECT 'BACKUP - PLAN_TIERS' as tabela;
SELECT * FROM plan_tiers ORDER BY monthly_price;

-- =============================================
-- 3. ESTADO ATUAL - RESUMO
-- =============================================

SELECT 
    'RESUMO DO SISTEMA' as info,
    (SELECT COUNT(*) FROM profiles) as total_usuarios,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
    (SELECT COUNT(*) FROM user_gamification) as total_gamification,
    (SELECT COUNT(*) FROM user_medals) as total_medalhas_conquistadas,
    (SELECT COUNT(*) FROM ranks) as total_patentes,
    (SELECT COUNT(*) FROM medals) as total_medalhas_disponiveis;

-- =============================================
-- 4. USUÁRIOS DE TESTE - ESTADO ATUAL
-- =============================================

SELECT 
    p.email,
    p.full_name,
    s.plan_id,
    pt.xp_multiplier,
    ug.current_rank_id,
    ug.total_points,
    ug.total_medals,
    p.created_at
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
LEFT JOIN plan_tiers pt ON pt.id = s.plan_id
LEFT JOIN user_gamification ug ON ug.user_id = p.id
WHERE p.email LIKE '%rotabusiness.com.br%' OR p.email = 'admin@rotaclub.com'
ORDER BY p.created_at;

-- =============================================
-- INSTRUÇÕES PARA RESTAURAR (SE NECESSÁRIO)
-- =============================================

/**
 * Se algo der errado após implementar triggers:
 * 
 * 1. Deletar dados de teste:
 *    DELETE FROM user_medals WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%rotabusiness%');
 *    UPDATE user_gamification SET total_points = 0, total_medals = 0, current_rank_id = 'novato' 
 *    WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%rotabusiness%');
 * 
 * 2. Git reset:
 *    git reset --hard HEAD
 * 
 * 3. Restart dev server:
 *    Ctrl+C no terminal npm run dev
 *    npm run dev novamente
 */
