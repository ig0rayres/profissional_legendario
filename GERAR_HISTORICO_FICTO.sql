-- ============================================================
-- GERAR DADOS FICTÍCIOS COERENTES - HISTÓRICO DE BATALHA
-- Para usuário Elite - Anos 2024 e 2025 (24 meses)
-- TODAS AS PATENTES aparecem + CONFRARIAS por mês
-- ============================================================

-- 1. Limpar dados antigos do usuário Elite
DO $$
DECLARE
    v_elite_user_id uuid;
BEGIN
    SELECT p.id INTO v_elite_user_id
    FROM profiles p
    JOIN subscriptions s ON s.user_id = p.id
    WHERE s.plan_id = 'elite' AND s.status = 'active'
    LIMIT 1;
    
    IF v_elite_user_id IS NOT NULL THEN
        DELETE FROM user_season_badges WHERE user_id = v_elite_user_id;
        DELETE FROM user_season_stats WHERE user_id = v_elite_user_id AND season_id IN (
            SELECT id FROM gamification_seasons WHERE year IN (2024, 2025)
        );
        -- Limpar confrarias fictícias antigas (onde Elite é member1)
        DELETE FROM confraternities WHERE member1_id = v_elite_user_id 
            AND date_occurred >= '2024-01-01' AND date_occurred < '2026-01-01';
        RAISE NOTICE '✅ Dados antigos limpos para usuário Elite';
    END IF;
END $$;

-- 2. Criar temporadas de 2024 e 2025 (se não existirem)
DO $$
DECLARE
    v_year integer;
    v_month integer;
    v_month_name text;
    v_start_date timestamp;
    v_end_date timestamp;
BEGIN
    FOR v_year IN 2024..2025 LOOP
        FOR v_month IN 1..12 LOOP
            v_month_name := CASE v_month
                WHEN 1 THEN 'Janeiro'
                WHEN 2 THEN 'Fevereiro'
                WHEN 3 THEN 'Março'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Maio'
                WHEN 6 THEN 'Junho'
                WHEN 7 THEN 'Julho'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Setembro'
                WHEN 10 THEN 'Outubro'
                WHEN 11 THEN 'Novembro'
                WHEN 12 THEN 'Dezembro'
            END || ' ' || v_year;
            
            v_start_date := make_date(v_year, v_month, 1)::timestamp;
            v_end_date := (make_date(v_year, v_month, 1) + interval '1 month' - interval '1 second')::timestamp;
            
            INSERT INTO gamification_seasons (year, month, name, starts_at, ends_at, is_active)
            VALUES (v_year, v_month, v_month_name, v_start_date, v_end_date, false)
            ON CONFLICT (year, month) DO UPDATE SET is_active = false;
        END LOOP;
    END LOOP;
    
    -- Garantir Janeiro 2026 ativa
    UPDATE gamification_seasons SET is_active = true WHERE year = 2026 AND month = 1;
END $$;

-- 3. Gerar dados com TODAS AS PATENTES distribuídas
-- Patentes: novato (0-199), especialista (200-499), guardiao (500-999), 
--           comandante (1000-1999), general (2000-3499), lenda (3500+)
DO $$
DECLARE
    v_elite_user_id uuid;
    v_other_user_id uuid; -- Outro usuário para ser member2 (constraint não permite member1=member2)
    v_season record;
    v_xp integer;
    v_rank text;
    v_ranking_position integer;
    v_month_index integer := 0;
    v_medal_id text;
    v_num_confraternities integer;
    v_conf_day integer;
    v_i integer;
    v_conf_id uuid;
    
    -- XP predefinido para garantir TODAS as patentes
    -- 24 meses: distribuir as 6 patentes 4x cada
    v_xp_distribution integer[] := ARRAY[
        -- 2024: Evolução de Novato até Guardião
        80,    -- Jan 2024 - Novato
        150,   -- Fev 2024 - Novato
        220,   -- Mar 2024 - Especialista
        320,   -- Abr 2024 - Especialista
        450,   -- Mai 2024 - Especialista
        520,   -- Jun 2024 - Guardião
        680,   -- Jul 2024 - Guardião
        850,   -- Ago 2024 - Guardião
        920,   -- Set 2024 - Guardião
        1050,  -- Out 2024 - Comandante
        1200,  -- Nov 2024 - Comandante
        1450,  -- Dez 2024 - Comandante
        -- 2025: Evolução de Comandante até Lenda
        1700,  -- Jan 2025 - Comandante
        1850,  -- Fev 2025 - Comandante
        2100,  -- Mar 2025 - General
        2350,  -- Abr 2025 - General
        2600,  -- Mai 2025 - General
        2900,  -- Jun 2025 - General
        3200,  -- Jul 2025 - General
        3550,  -- Ago 2025 - Lenda
        3800,  -- Set 2025 - Lenda
        4100,  -- Out 2025 - Lenda
        4500,  -- Nov 2025 - Lenda
        5000   -- Dez 2025 - Lenda (campeão!)
    ];
    
    -- Confrarias por mês (crescendo com o tempo)
    v_conf_distribution integer[] := ARRAY[
        0, 0, 1, 0, 1, 1,   -- Jan-Jun 2024
        2, 1, 2, 2, 3, 2,   -- Jul-Dez 2024
        3, 2, 3, 4, 3, 4,   -- Jan-Jun 2025
        5, 4, 5, 6, 5, 7    -- Jul-Dez 2025
    ];
BEGIN
    -- Buscar usuário Elite
    SELECT p.id INTO v_elite_user_id
    FROM profiles p
    JOIN subscriptions s ON s.user_id = p.id
    WHERE s.plan_id = 'elite' AND s.status = 'active'
    LIMIT 1;
    
    -- FALLBACK: Se não encontrar Elite, pegar qualquer usuário
    IF v_elite_user_id IS NULL THEN
        SELECT id INTO v_elite_user_id FROM profiles LIMIT 1;
        RAISE NOTICE '⚠️ Nenhum Elite encontrado, usando primeiro usuário disponível';
    END IF;
    
    -- Buscar OUTRO usuário para ser member2 (diferente do primeiro)
    SELECT id INTO v_other_user_id
    FROM profiles
    WHERE id != v_elite_user_id
    LIMIT 1;
    
    IF v_elite_user_id IS NULL THEN
        RAISE NOTICE '⚠️ Nenhum usuário encontrado!';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Usuário selecionado: %', v_elite_user_id;
    
    -- Para cada temporada de 2024 e 2025
    FOR v_season IN 
        SELECT id, year, month, name 
        FROM gamification_seasons 
        WHERE year IN (2024, 2025)
        ORDER BY year, month
    LOOP
        v_month_index := v_month_index + 1;
        
        -- XP do array predefinido
        v_xp := v_xp_distribution[v_month_index];
        
        -- Determinar rank baseado no XP
        v_rank := CASE
            WHEN v_xp >= 3500 THEN 'lenda'
            WHEN v_xp >= 2000 THEN 'general'
            WHEN v_xp >= 1000 THEN 'comandante'
            WHEN v_xp >= 500 THEN 'guardiao'
            WHEN v_xp >= 200 THEN 'especialista'
            ELSE 'novato'
        END;
        
        -- Posição no ranking - GARANTIR TOP 3 para patentes altas
        v_ranking_position := CASE v_rank
            WHEN 'lenda' THEN 1  -- SEMPRE top 1 (campeão!)
            WHEN 'general' THEN 1 + floor(random() * 3)::integer -- Top 1-3 (destaque)
            WHEN 'comandante' THEN 4 + floor(random() * 4)::integer -- Top 4-7
            WHEN 'guardiao' THEN 8 + floor(random() * 5)::integer -- Top 8-12
            WHEN 'especialista' THEN 13 + floor(random() * 6)::integer -- Top 13-18
            ELSE 19 + floor(random() * 7)::integer -- Top 19-25
        END;
        
        -- Inserir stats
        INSERT INTO user_season_stats (
            user_id, season_id, total_xp, rank_id, 
            daily_xp_count, last_xp_date, ranking_position
        ) VALUES (
            v_elite_user_id, v_season.id, v_xp, v_rank,
            0, make_date(v_season.year, v_season.month, 28), v_ranking_position
        )
        ON CONFLICT (user_id, season_id) DO UPDATE SET
            total_xp = EXCLUDED.total_xp,
            rank_id = EXCLUDED.rank_id,
            ranking_position = EXCLUDED.ranking_position;
        
        -- ============================================================
        -- INSERIR CONFRARIAS DO MÊS
        -- ============================================================
        v_num_confraternities := v_conf_distribution[v_month_index];
        
        FOR v_i IN 1..v_num_confraternities LOOP
            v_conf_day := 3 + (v_i * 4) + floor(random() * 3)::integer;
            IF v_conf_day > 28 THEN v_conf_day := 28; END IF;
            
            -- Usa a estrutura correta: member1_id, member2_id, date_occurred
            INSERT INTO confraternities (
                id, invite_id, member1_id, member2_id, 
                date_occurred, location, description, 
                photos, visibility
            ) VALUES (
                gen_random_uuid(),
                NULL, -- Sem convite (gerado manualmente)
                v_elite_user_id,
                v_other_user_id, -- Outro usuário (constraint não permite member1=member2)
                make_timestamp(v_season.year, v_season.month, v_conf_day, 19, 0, 0),
                CASE floor(random() * 5)::integer
                    WHEN 0 THEN 'Restaurante Central'
                    WHEN 1 THEN 'Café Premium'
                    WHEN 2 THEN 'Espaço Eventos'
                    WHEN 3 THEN 'Chácara Encontros'
                    ELSE 'Salão Comunidade'
                END,
                'Encontro de networking e comunhão entre membros da Rota #' || v_i,
                '[]'::jsonb,
                'public'
            );
        END LOOP;
        
        -- ============================================================
        -- INSERIR MEDALHAS PROPORCIONAIS AO XP
        -- ============================================================
        
        -- Medalhas mais prováveis conforme XP cresce
        IF v_xp >= 100 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'alistamento_concluido', 
                    make_timestamp(v_season.year, v_season.month, 5, 14, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 200 AND random() < 0.7 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'cinegrafista_campo', 
                    make_timestamp(v_season.year, v_season.month, 8, 10, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 400 AND random() < 0.6 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'presente', 
                    make_timestamp(v_season.year, v_season.month, 12, 15, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_num_confraternities > 0 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'primeira_confraria', 
                    make_timestamp(v_season.year, v_season.month, 15, 20, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 800 AND random() < 0.5 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'batismo_excelencia', 
                    make_timestamp(v_season.year, v_season.month, 18, 16, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 1200 AND random() < 0.6 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'networker_ativo', 
                    make_timestamp(v_season.year, v_season.month, 20, 9, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 1500 AND random() < 0.5 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'missao_cumprida', 
                    make_timestamp(v_season.year, v_season.month, 22, 14, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 2000 AND random() < 0.4 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'irmandade', 
                    make_timestamp(v_season.year, v_season.month, 24, 13, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 3000 AND random() < 0.4 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'primeiro_sangue', 
                    make_timestamp(v_season.year, v_season.month, 25, 17, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF v_xp >= 4000 AND random() < 0.3 THEN
            INSERT INTO user_season_badges (user_id, season_id, badge_id, earned_at)
            VALUES (v_elite_user_id, v_season.id, 'mestre_conexoes', 
                    make_timestamp(v_season.year, v_season.month, 26, 18, 0, 0))
            ON CONFLICT DO NOTHING;
        END IF;
        
        RAISE NOTICE '% - % XP = % #% | % confrarias', 
            v_season.name, v_xp, v_rank, v_ranking_position, v_num_confraternities;
    END LOOP;
END $$;

-- 4. Verificar resultado
SELECT 
    gs.name as temporada,
    uss.total_xp as vigor,
    uss.rank_id as patente,
    uss.ranking_position as posicao,
    (SELECT COUNT(*) FROM user_season_badges usb WHERE usb.season_id = gs.id AND usb.user_id = uss.user_id) as medalhas,
    (SELECT COUNT(*) FROM confraternities c 
     WHERE c.member1_id = uss.user_id 
       AND EXTRACT(YEAR FROM c.date_occurred) = gs.year 
       AND EXTRACT(MONTH FROM c.date_occurred) = gs.month
    ) as confrarias
FROM user_season_stats uss
JOIN gamification_seasons gs ON gs.id = uss.season_id
WHERE uss.user_id IN (
    SELECT p.id FROM profiles p
    JOIN subscriptions s ON s.user_id = p.id
    WHERE s.plan_id = 'elite' AND s.status = 'active'
    LIMIT 1
)
ORDER BY gs.year DESC, gs.month DESC
LIMIT 24;

-- 5. Resumo das patentes
SELECT 
    uss.rank_id as patente,
    COUNT(*) as meses_nesta_patente,
    MIN(uss.total_xp) as xp_min,
    MAX(uss.total_xp) as xp_max
FROM user_season_stats uss
JOIN gamification_seasons gs ON gs.id = uss.season_id
WHERE uss.user_id IN (
    SELECT p.id FROM profiles p
    JOIN subscriptions s ON s.user_id = p.id
    WHERE s.plan_id = 'elite' AND s.status = 'active'
    LIMIT 1
)
AND gs.year IN (2024, 2025)
GROUP BY uss.rank_id
ORDER BY xp_max DESC;

SELECT '✅ Histórico com TODAS AS PATENTES e CONFRARIAS gerado!' as resultado;
