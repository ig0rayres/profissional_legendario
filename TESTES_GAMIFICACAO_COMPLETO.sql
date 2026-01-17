-- =============================================
-- TESTES COMPLETOS DE GAMIFICAÇÃO
-- =============================================
-- Testar sistema de pontos, medalhas e multiplicadores

-- =============================================
-- PREPARAÇÃO: Verificar contas de teste
-- =============================================
SELECT 
    p.email,
    p.full_name,
    s.plan_id,
    pt.xp_multiplier,
    ug.current_rank_id,
    ug.total_points,
    ug.total_medals
FROM profiles p
JOIN subscriptions s ON s.user_id = p.id
JOIN plan_tiers pt ON pt.id = s.plan_id
JOIN user_gamification ug ON ug.user_id = p.id
WHERE p.email LIKE '%rotabusiness.com.br%'
ORDER BY pt.xp_multiplier;

-- =============================================
-- TESTE 1: RECRUTA - Medalha "Alistamento Concluído" (50 pts)
-- =============================================
-- Multiplicador: 1.0x = 50 pontos
-- Deve subir para patente "Especialista" se tiver 100+ pts

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'recruta@rotabusiness.com.br'),
    'alistamento_concluido'
);

-- Verificar resultado
SELECT 
    p.email,
    ug.total_points as pontos_atuais,
    ug.current_rank_id as patente,
    ug.total_medals as medalhas,
    um.medal_id,
    m.points_reward as pontos_base,
    pt.xp_multiplier as multiplicador
FROM profiles p
JOIN user_gamification ug ON ug.user_id = p.id
JOIN subscriptions s ON s.user_id = p.id
JOIN plan_tiers pt ON pt.id = s.plan_id
LEFT JOIN user_medals um ON um.user_id = p.id
LEFT JOIN medals m ON m.id = um.medal_id
WHERE p.email = 'recruta@rotabusiness.com.br';

-- =============================================
-- TESTE 2: VETERANO - Medalha "Primeiro Sangue" (100 pts)
-- =============================================
-- Multiplicador: 1.5x = 150 pontos
-- Deve subir para "Guardião" (200 pts necessários)

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'veterano@rotabusiness.com.br'),
    'primeiro_sangue'
);

-- Verificar resultado
SELECT 
    p.email,
    ug.total_points as pontos_atuais,
    ug.current_rank_id as patente,
    ug.total_medals as medalhas,
    um.medal_id,
    m.points_reward as pontos_base,
    pt.xp_multiplier as multiplicador,
    (m.points_reward * pt.xp_multiplier) as pontos_calculados
FROM profiles p
JOIN user_gamification ug ON ug.user_id = p.id
JOIN subscriptions s ON s.user_id = p.id
JOIN plan_tiers pt ON pt.id = s.plan_id
LEFT JOIN user_medals um ON um.user_id = p.id
LEFT JOIN medals m ON m.id = um.medal_id
WHERE p.email = 'veterano@rotabusiness.com.br';

-- =============================================
-- TESTE 3: ELITE - Medalha "Batismo de Excelência" (150 pts)
-- =============================================
-- Multiplicador: 3.0x = 450 pontos
-- Deve subir direto para "Comandante" (500 pts necessários)

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br'),
    'batismo_excelencia'
);

-- Verificar resultado
SELECT 
    p.email,
    ug.total_points as pontos_atuais,
    ug.current_rank_id as patente,
    ug.total_medals as medalhas,
    um.medal_id,
    m.points_reward as pontos_base,
    pt.xp_multiplier as multiplicador,
    (m.points_reward * pt.xp_multiplier) as pontos_calculados
FROM profiles p
JOIN user_gamification ug ON ug.user_id = p.id
JOIN subscriptions s ON s.user_id = p.id
JOIN plan_tiers pt ON pt.id = s.plan_id
LEFT JOIN user_medals um ON um.user_id = p.id
LEFT JOIN medals m ON m.id = um.medal_id
WHERE p.email = 'elite@rotabusiness.com.br';

-- =============================================
-- TESTE 4: Dar VÁRIAS medalhas para o ELITE
-- =============================================
-- Dar 4 medalhas para acumular pontos e subir patentes

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br'),
    'cinegrafista_campo'
);

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br'),
    'missao_cumprida'
);

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br'),
    'inabalavel'
);

SELECT award_medal(
    (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br'),
    'irmandade'
);

-- Verificar resultado final ELITE
SELECT 
    p.email,
    p.full_name,
    ug.total_points as pontos_totais,
    ug.current_rank_id as patente_atual,
    ug.total_medals as total_medalhas,
    r.name as nome_patente,
    r.points_required as pts_necessarios_patente
FROM profiles p
JOIN user_gamification ug ON ug.user_id = p.id
JOIN ranks r ON r.id = ug.current_rank_id
WHERE p.email = 'elite@rotabusiness.com.br';

-- Ver TODAS as medalhas do ELITE
SELECT 
    m.name as medalha,
    m.points_reward as pontos_base,
    (m.points_reward * 3.0) as pontos_com_multiplicador,
    um.earned_at as conquistada_em
FROM user_medals um
JOIN medals m ON m.id = um.medal_id
WHERE um.user_id = (SELECT id FROM profiles WHERE email = 'elite@rotabusiness.com.br')
ORDER BY um.earned_at;

-- =============================================
-- VALIDAÇÃO FINAL - RESUMO GERAL
-- =============================================
SELECT 
    p.email,
    p.full_name as nome,
    s.plan_id as plano,
    pt.xp_multiplier as multiplicador,
    ug.total_points as pontos,
    ug.current_rank_id as patente,
    r.name as nome_patente,
    r.points_required as pts_necessarios,
    ug.total_medals as medalhas
FROM profiles p
JOIN subscriptions s ON s.user_id = p.id
JOIN plan_tiers pt ON pt.id = s.plan_id
JOIN user_gamification ug ON ug.user_id = p.id
JOIN ranks r ON r.id = ug.current_rank_id
WHERE p.email LIKE '%rotabusiness.com.br%'
ORDER BY ug.total_points DESC;

-- =============================================
-- CHECKLIST DE VALIDAÇÃO
-- =============================================
/**
 * ✅ RESULTADOS ESPERADOS:
 * 
 * RECRUTA (multiplicador 1.0x):
 * - 1 medalha (50 pontos base x 1.0 = 50 pontos)
 * - Patente: Novato (precisa 100 pts para subir)
 * 
 * VETERANO (multiplicador 1.5x):
 * - 1 medalha (100 pontos base x 1.5 = 150 pontos)
 * - Patente: Guardião (200 pts necessários, tem 150)
 * 
 * ELITE (multiplicador 3.0x):
 * - 5 medalhas
 * - Pontos totais: 150+100+200+150+50 = 650 pontos base x 3.0 = 1950 pontos
 * - Patente: General (1000 pts) ou Lenda (2000 pts)
 * 
 * ☑️ Sistema de PONTOS: Multiplicadores aplicados?
 * ☑️ Sistema de MEDALHAS: Aparecem em user_medals?
 * ☑️ Sistema de PATENTES: Sobem automaticamente?
 */
