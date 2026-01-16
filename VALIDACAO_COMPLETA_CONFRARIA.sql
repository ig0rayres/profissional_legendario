-- ============================================
-- VALIDAÇÃO COMPLETA - MÓDULO DE CONFRARIA
-- Execute este script no Supabase SQL Editor
-- ============================================

-- ====================================
-- PASSO 1: LIMPAR DADOS ANTERIORES
-- ====================================
SELECT '=== LIMPANDO DADOS ANTERIORES ===' as etapa;

-- Deletar confraternizações antigas
DELETE FROM confraternities WHERE member1_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@rotatest.com'
);

-- Deletar convites antigos
DELETE FROM confraternity_invites WHERE sender_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@rotatest.com'
);

-- Resetar limites
DELETE FROM confraternity_limits WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@rotatest.com'
);

-- Deletar usuários de teste antigos
DELETE FROM auth.users WHERE email IN (
    'recruta@rotatest.com',
    'veterano@rotatest.com',
    'elite@rotatest.com'
);

SELECT 'Dados antigos removidos!' as resultado;

-- ====================================
-- PASSO 2: CRIAR USUÁRIOS DE TESTE
-- ====================================
SELECT '=== CRIANDO USUÁRIOS DE TESTE ===' as etapa;

-- RECRUTA
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'recruta@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Recruta Teste","cpf":"123.456.789-09"}',
    false, false, now(), now()
);

-- VETERANO
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'veterano@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Veterano Teste","cpf":"987.654.321-00"}',
    false, false, now(), now()
);

-- ELITE
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'elite@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elite Teste","cpf":"111.444.777-35"}',
    false, false, now(), now()
);

SELECT 'Usuários criados!' as resultado;

-- ====================================
-- PASSO 3: ATRIBUIR PLANOS
-- ====================================
SELECT '=== ATRIBUINDO PLANOS ===' as etapa;

UPDATE profiles 
SET subscription_tier = 'recruta',
    subscription_status = 'active'
WHERE email = 'recruta@rotatest.com';

UPDATE profiles 
SET subscription_tier = 'veterano',
    subscription_status = 'active'
WHERE email = 'veterano@rotatest.com';

UPDATE profiles 
SET subscription_tier = 'elite',
    subscription_status = 'active'
WHERE email = 'elite@rotatest.com';

SELECT 'Planos atribuídos!' as resultado;

-- ====================================
-- PASSO 4: VERIFICAR SETUP
-- ====================================
SELECT '=== VERIFICANDO SETUP ===' as etapa;

SELECT 
    u.email,
    p.full_name,
    p.subscription_tier as plano,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%@rotatest.com'
ORDER BY u.email;

-- ====================================
-- PASSO 5: TESTAR LIMITES
-- ====================================
SELECT '=== TESTANDO LIMITES POR PLANO ===' as etapa;

DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
    v_can_send boolean;
BEGIN
    -- Obter IDs
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotatest.com';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotatest.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotatest.com';
    
    -- RECRUTA (esperado: FALSE)
    SELECT check_confraternity_limit(v_recruta_id) INTO v_can_send;
    RAISE NOTICE '✓ Recruta pode enviar? % (esperado: FALSE)', v_can_send;
    
    -- VETERANO (esperado: TRUE)
    SELECT check_confraternity_limit(v_veterano_id) INTO v_can_send;
    RAISE NOTICE '✓ Veterano pode enviar? % (esperado: TRUE)', v_can_send;
    
    -- ELITE (esperado: TRUE)
    SELECT check_confraternity_limit(v_elite_id) INTO v_can_send;
    RAISE NOTICE '✓ Elite pode enviar? % (esperado: TRUE)', v_can_send;
END $$;

-- ====================================
-- PASSO 6: TESTAR ENVIO DE CONVITES
-- ====================================
SELECT '=== TESTANDO ENVIO DE CONVITES ===' as etapa;

DO $$
DECLARE
    v_veterano_id uuid;
    v_recruta_id uuid;
    v_elite_id uuid;
    v_can_send boolean;
BEGIN
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotatest.com';
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotatest.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotatest.com';
    
    -- Convite 1: Veterano -> Recruta
    INSERT INTO confraternity_invites (sender_id, receiver_id, status, message, proposed_date)
    VALUES (v_veterano_id, v_recruta_id, 'pending', 'Vamos tomar um café!', now() + interval '7 days');
    PERFORM increment_confraternity_count(v_veterano_id);
    RAISE NOTICE '✓ Convite 1 enviado: Veterano -> Recruta';
    
    -- Convite 2: Veterano -> Elite
    INSERT INTO confraternity_invites (sender_id, receiver_id, status, message, proposed_date)
    VALUES (v_veterano_id, v_elite_id, 'pending', 'Vamos fazer networking!', now() + interval '7 days');
    PERFORM increment_confraternity_count(v_veterano_id);
    RAISE NOTICE '✓ Convite 2 enviado: Veterano -> Elite';
    
    -- Verificar limite atingido
    SELECT check_confraternity_limit(v_veterano_id) INTO v_can_send;
    RAISE NOTICE '✓ Veterano pode enviar 3º convite? % (esperado: FALSE)', v_can_send;
END $$;

-- ====================================
-- PASSO 7: TESTAR ACEITAÇÃO
-- ====================================
SELECT '=== TESTANDO ACEITAÇÃO DE CONVITES ===' as etapa;

DO $$
DECLARE
    v_veterano_id uuid;
    v_recruta_id uuid;
BEGIN
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotatest.com';
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotatest.com';
    
    -- Recruta aceita convite
    UPDATE confraternity_invites 
    SET status = 'accepted', accepted_at = now()
    WHERE sender_id = v_veterano_id AND receiver_id = v_recruta_id;
    
    RAISE NOTICE '✓ Convite aceito por Recruta';
END $$;

-- ====================================
-- PASSO 8: TESTAR REJEIÇÃO
-- ====================================
SELECT '=== TESTANDO REJEIÇÃO DE CONVITES ===' as etapa;

DO $$
DECLARE
    v_veterano_id uuid;
    v_elite_id uuid;
BEGIN
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotatest.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotatest.com';
    
    -- Elite recusa convite
    UPDATE confraternity_invites 
    SET status = 'rejected'
    WHERE sender_id = v_veterano_id AND receiver_id = v_elite_id;
    
    RAISE NOTICE '✓ Convite recusado por Elite';
END $$;

-- ====================================
-- PASSO 9: TESTAR COMPLETAR
-- ====================================
SELECT '=== TESTANDO COMPLETAR CONFRATERNIZAÇÃO ===' as etapa;

DO $$
DECLARE
    v_veterano_id uuid;
    v_recruta_id uuid;
    v_invite_id uuid;
BEGIN
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotatest.com';
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotatest.com';
    
    -- Obter ID do convite aceito
    SELECT id INTO v_invite_id 
    FROM confraternity_invites 
    WHERE sender_id = v_veterano_id AND receiver_id = v_recruta_id;
    
    -- Marcar como completado
    UPDATE confraternity_invites 
    SET status = 'completed', completed_at = now()
    WHERE id = v_invite_id;
    
    -- Criar registro de confraternização
    INSERT INTO confraternities (
        invite_id, member1_id, member2_id,
        date_occurred, location, description, visibility
    ) VALUES (
        v_invite_id, v_veterano_id, v_recruta_id,
        now(), 'Café Central - Maringá',
        'Ótima conversa sobre negócios!', 'public'
    );
    
    RAISE NOTICE '✓ Confraternização registrada!';
END $$;

-- ====================================
-- RESULTADOS FINAIS
-- ====================================

SELECT '=== CONVITES ENVIADOS ===' as relatorio;
SELECT 
    p1.full_name as remetente,
    p2.full_name as destinatario,
    ci.status,
    ci.message,
    ci.proposed_date,
    ci.created_at
FROM confraternity_invites ci
JOIN profiles p1 ON p1.id = ci.sender_id
JOIN profiles p2 ON p2.id = ci.receiver_id
ORDER BY ci.created_at DESC;

SELECT '=== LIMITES UTILIZADOS ===' as relatorio;
SELECT 
    p.full_name,
    p.subscription_tier as plano,
    COALESCE(cl.invites_sent, 0) as convites_enviados,
    CASE p.subscription_tier
        WHEN 'recruta' THEN 0
        WHEN 'veterano' THEN 2
        WHEN 'elite' THEN 10
    END as limite_maximo
FROM profiles p
LEFT JOIN confraternity_limits cl ON cl.user_id = p.id
WHERE p.email LIKE '%@rotatest.com'
ORDER BY p.email;

SELECT '=== CONFRATERNIZAÇÕES REALIZADAS ===' as relatorio;
SELECT 
    p1.full_name as membro1,
    p2.full_name as membro2,
    c.location as local,
    c.description,
    c.visibility,
    c.date_occurred
FROM confraternities c
JOIN profiles p1 ON p1.id = c.member1_id
JOIN profiles p2 ON p2.id = c.member2_id
ORDER BY c.date_occurred DESC;

-- ====================================
-- FIM DA VALIDAÇÃO
-- ====================================
SELECT '✅ VALIDAÇÃO COMPLETA!' as status_final;
