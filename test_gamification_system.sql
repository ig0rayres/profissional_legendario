# TESTE COMPLETO DO SISTEMA DE GAMIFICAÇÃO

## Teste 1: Verificar Tabelas Criadas
-- Execute no Supabase SQL Editor

-- 1.1 Verificar ranks
SELECT COUNT(*) as total_ranks, 
       STRING_AGG(name, ', ' ORDER BY display_order) as ranks_list 
FROM ranks;
-- Esperado: 6 ranks (Recruta, Especialista, Veterano, Comandante, General, Lenda)

-- 1.2 Verificar badges
SELECT COUNT(*) as total_badges,
       STRING_AGG(name, ', ') as badges_list
FROM badges 
WHERE is_active = true;
-- Esperado: 12 badges

-- 1.3 Verificar estrutura das tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ranks', 'badges', 'gamification_stats', 'xp_logs', 'user_badges')
ORDER BY table_name;
-- Esperado: 5 tabelas

---

## Teste 2: Testar Funções SQL

-- 2.1 Criar usuário de teste (se não existir)
-- Substitua 'SEU_USER_ID' por um ID real de um usuário em profiles
DO $$
DECLARE
    test_user_id uuid := '00000000-0000-0000-0000-000000000001'; -- SUBSTITUA
BEGIN
    -- Limpar dados de teste anteriores
    DELETE FROM user_badges WHERE user_id = test_user_id;
    DELETE FROM xp_logs WHERE user_id = test_user_id;
    DELETE FROM gamification_stats WHERE user_id = test_user_id;
END $$;

-- 2.2 Testar add_user_xp()
SELECT add_user_xp(
    '00000000-0000-0000-0000-000000000001'::uuid,  -- SUBSTITUA pelo user_id real
    100,                                            -- 100 pontos base
    'test_action',
    'Teste manual de pontuação'
) as pontos_concedidos;
-- Esperado: 100 (com multiplicador 1.00x de Recruta)

-- 2.3 Verificar se foi registrado
SELECT * FROM gamification_stats 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Esperado: total_xp = 100, current_rank_id = 'recruta'

SELECT * FROM xp_logs 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC 
LIMIT 5;
-- Esperado: 1 registro com amount = 100

-- 2.4 Testar award_badge()
SELECT award_badge(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'alistamento_concluido'
) as badge_concedida;
-- Esperado: true

-- 2.5 Verificar badge concedida
SELECT b.name, ub.earned_at 
FROM user_badges ub 
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = '00000000-0000-0000-0000-000000000001';
-- Esperado: 1 badge (Alistamento Concluído)

-- 2.6 Verificar XP da badge foi adicionado
SELECT total_xp FROM gamification_stats 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Esperado: 200 (100 do teste + 100 da badge)

---

## Teste 3: Testar Progressão de Ranks

-- 3.1 Adicionar pontos para subir de rank (Recruta → Especialista precisa 200 XP)
SELECT add_user_xp(
    '00000000-0000-0000-0000-000000000001'::uuid,
    100,
    'test_rank_up',
    'Teste de progressão de rank'
);

-- 3.2 Verificar novo rank
SELECT total_xp, current_rank_id 
FROM gamification_stats 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Esperado: total_xp >= 200, current_rank_id = 'especialista'

-- 3.3 Testar multiplicador do novo rank
SELECT add_user_xp(
    '00000000-0000-0000-0000-000000000001'::uuid,
    100,
    'test_multiplier',
    'Teste de multiplicador'
);
-- Esperado: 100 pontos (Especialista tem multiplicador 1.00x)

---

## Teste 4: Testar Limite Diário

-- 4.1 Adicionar pontos repetidamente até atingir limite (500 pts/dia)
DO $$
DECLARE
    test_user_id uuid := '00000000-0000-0000-0000-000000000001';
    i INTEGER;
BEGIN
    -- Adicionar 50 pts, 12 vezes = 600 pts (excede limite)
    FOR i IN 1..12 LOOP
        PERFORM add_user_xp(test_user_id, 50, 'daily_limit_test', 'Teste limite diário - ' || i);
    END LOOP;
END $$;

-- 4.2 Verificar daily_xp_count
SELECT daily_xp_count, last_xp_date 
FROM gamification_stats 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Esperado: daily_xp_count <= 500 (limite aplicado)

---

## Teste 5: Verificar Todas as Badges

SELECT 
    id,
    name,
    xp_reward,
    criteria_type,
    is_active
FROM badges
ORDER BY xp_reward DESC;

-- Resultado esperado:
-- sentinela_elite (500 XP)
-- veterano_guerra (300 XP)
-- sentinela_inabalavel (200 XP)
-- inabalavel (150 XP)
-- recrutador (150 XP)
-- alistamento_concluido (100 XP)
-- missao_cumprida (100 XP)
-- batismo_excelencia (80 XP)
-- irmandade (75 XP)
-- pronto_missao (50 XP)
-- cinegrafista_campo (30 XP)
-- primeiro_sangue (50 XP)

---

## Teste 6: Verificar Integração com Frontend

-- 6.1 Criar dados de teste para visualizar no admin
INSERT INTO gamification_stats (user_id, total_xp, current_rank_id, season_xp)
SELECT 
    id,
    CASE 
        WHEN random() < 0.2 THEN floor(random() * 199)::int        -- Recruta (20%)
        WHEN random() < 0.4 THEN floor(200 + random() * 299)::int  -- Especialista (20%)
        WHEN random() < 0.6 THEN floor(500 + random() * 499)::int  -- Veterano (20%)
        WHEN random() < 0.8 THEN floor(1000 + random() * 999)::int -- Comandante (20%)
        WHEN random() < 0.95 THEN floor(2000 + random() * 1499)::int -- General (15%)
        ELSE floor(3500 + random() * 1500)::int                     -- Lenda (5%)
    END as xp,
    CASE 
        WHEN random() < 0.2 THEN 'recruta'
        WHEN random() < 0.4 THEN 'especialista'
        WHEN random() < 0.6 THEN 'veterano'
        WHEN random() < 0.8 THEN 'comandante'
        WHEN random() < 0.95 THEN 'general'
        ELSE 'lenda'
    END as rank_id,
    CASE 
        WHEN random() < 0.2 THEN floor(random() * 199)::int
        WHEN random() < 0.4 THEN floor(200 + random() * 299)::int
        WHEN random() < 0.6 THEN floor(500 + random() * 499)::int
        WHEN random() < 0.8 THEN floor(1000 + random() * 999)::int
        WHEN random() < 0.95 THEN floor(2000 + random() * 1499)::int
        ELSE floor(3500 + random() * 1500)::int
    END as season_xp
FROM profiles
LIMIT 10
ON CONFLICT (user_id) DO NOTHING;

-- 6.2 Verificar dados criados
SELECT 
    gs.user_id,
    p.full_name,
    gs.total_xp,
    r.name as rank_name,
    r.multiplier
FROM gamification_stats gs
JOIN profiles p ON p.id = gs.user_id
JOIN ranks r ON r.id = gs.current_rank_id
ORDER BY gs.total_xp DESC
LIMIT 10;

---

## RESUMO DOS TESTES

Execute cada seção acima no SQL Editor do Supabase e anote os resultados.

### Checklist:
- [ ] Tabelas criadas (5/5)
- [ ] Ranks instalados (6/6)
- [ ] Badges instaladas (12/12)
- [ ] Função add_user_xp() funcionando
- [ ] Função award_badge() funcionando
- [ ] Função check_rank_up() funcionando
- [ ] Multiplicadores aplicados corretamente
- [ ] Limite diário aplicado (500 pts)
- [ ] Progressão de ranks automática
- [ ] Dados visíveis no admin panel
