-- =============================================
-- ATUALIZAR PLANOS DOS USUÁRIOS DE TESTE
-- =============================================

-- 1. Atualizar usuário Veterano para plano veterano
UPDATE public.subscriptions
SET plan_id = 'veterano'
WHERE user_id = (
    SELECT id FROM public.profiles 
    WHERE email = 'veterano@rotabusiness.com.br'
);

-- 2. Atualizar usuário Elite para plano elite
UPDATE public.subscriptions
SET plan_id = 'elite'
WHERE user_id = (
    SELECT id FROM public.profiles 
    WHERE email = 'elite@rotabusiness.com.br'
);

-- 3. Verificar os planos atualizados
SELECT 
    p.email,
    p.full_name,
    s.plan_id as plano,
    pt.monthly_price as preco_mensal,
    pt.xp_multiplier as multiplicador
FROM public.profiles p
JOIN public.subscriptions s ON s.user_id = p.id
JOIN public.plan_tiers pt ON pt.id = s.plan_id
WHERE p.email LIKE '%rotabusiness.com.br%'
ORDER BY pt.monthly_price;
