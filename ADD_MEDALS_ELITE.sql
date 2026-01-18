-- ADICIONAR MEDALHAS AO USUÁRIO ELITE PARA TESTE
-- Execute no Supabase SQL Editor

-- Encontrar ID do usuário elite
DO $$
DECLARE
    v_elite_user_id uuid;
BEGIN
    -- Buscar usuário com plano elite
    SELECT s.user_id INTO v_elite_user_id
    FROM subscriptions s
    WHERE s.plan_id = 'elite'
    LIMIT 1;
    
    IF v_elite_user_id IS NULL THEN
        -- Tenta buscar por email
        SELECT id INTO v_elite_user_id FROM profiles WHERE email ILIKE '%elite%' LIMIT 1;
    END IF;
    
    IF v_elite_user_id IS NOT NULL THEN
        -- Adicionar medalhas
        INSERT INTO user_medals (user_id, medal_id, earned_at) VALUES
            (v_elite_user_id, 'alistamento_concluido', now() - interval '10 days'),
            (v_elite_user_id, 'primeiro_sangue', now() - interval '8 days'),
            (v_elite_user_id, 'batismo_excelencia', now() - interval '6 days'),
            (v_elite_user_id, 'missao_cumprida', now() - interval '4 days'),
            (v_elite_user_id, 'inabalavel', now() - interval '2 days'),
            (v_elite_user_id, 'irmandade', now() - interval '1 day'),
            (v_elite_user_id, 'veterano_guerra', now()),
            (v_elite_user_id, 'sentinela_elite', now())
        ON CONFLICT (user_id, medal_id) DO NOTHING;
        
        RAISE NOTICE 'Medalhas adicionadas ao usuário elite: %', v_elite_user_id;
    ELSE   
        RAISE NOTICE 'Nenhum usuário elite encontrado!';
    END IF;
END $$;

-- Verificar medalhas adicionadas
SELECT 
    p.email,
    m.name as medal_name,
    um.earned_at
FROM user_medals um
JOIN profiles p ON p.id = um.user_id
JOIN medals m ON m.id = um.medal_id
ORDER BY um.earned_at DESC
LIMIT 10;
