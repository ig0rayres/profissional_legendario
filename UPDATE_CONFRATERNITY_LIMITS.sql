-- ATUALIZAR LIMITES DE CONFRARIA POR PLANO
-- Execute no Supabase SQL Editor

-- Verificar tabela de planos
SELECT * FROM plan_tiers;

-- Atualizar limites de confraria:
-- Recruta: 0 (não pode enviar, só recebe)
-- Veterano: 4 por mês
-- Elite: 10 por mês

UPDATE plan_tiers SET 
    confraternities_per_month = 0
WHERE id = 'recruta';

UPDATE plan_tiers SET 
    confraternities_per_month = 4
WHERE id = 'veterano';

UPDATE plan_tiers SET 
    confraternities_per_month = 10
WHERE id = 'elite';

-- Verificar resultado
SELECT id, name, confraternities_per_month FROM plan_tiers ORDER BY price;
