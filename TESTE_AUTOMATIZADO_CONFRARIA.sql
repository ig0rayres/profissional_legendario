-- ============================================
-- TESTE AUTOMATIZADO - SISTEMA DE CONFRARIA
-- Simula todo o fluxo: enviar, aceitar, recusar
-- ============================================

-- ====================================
-- PARTE 1: TESTAR LIMITES POR PLANO
-- ====================================

-- Pegar IDs dos usuários de teste
DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
    v_can_send boolean;
BEGIN
    -- Obter IDs
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta.teste@rotabusiness.com';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano.teste@rotabusiness.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite.teste@rotabusiness.com';

    RAISE NOTICE '=== TESTE 1: VERIFICAR LIMITES ===';
    
    -- RECRUTA (deve retornar FALSE - 0 convites)
    SELECT check_confraternity_limit(v_recruta_id) INTO v_can_send;
    RAISE NOTICE 'Recruta pode enviar? % (esperado: FALSE)', v_can_send;
    
    -- VETERANO (deve retornar TRUE - tem 2 convites)
    SELECT check_confraternity_limit(v_veterano_id) INTO v_can_send;
    RAISE NOTICE 'Veterano pode enviar? % (esperado: TRUE)', v_can_send;
    
    -- ELITE (deve retornar TRUE - tem 10 convites)
    SELECT check_confraternity_limit(v_elite_id) INTO v_can_send;
    RAISE NOTICE 'Elite pode enviar? % (esperado: TRUE)', v_can_send;

    RAISE NOTICE '';
    RAISE NOTICE '=== TESTE 2: SIMULAR ENVIO DE CONVITES ===';
    
    -- VETERANO envia convite para RECRUTA
    INSERT INTO confraternity_invites (sender_id, receiver_id, status, message, proposed_date)
    VALUES (v_veterano_id, v_recruta_id, 'pending', 'Vamos tomar um café!', now() + interval '7 days');
    RAISE NOTICE 'Convite 1 enviado: Veterano -> Recruta';
    
    -- Incrementar contador
    PERFORM increment_confraternity_count(v_veterano_id);
    
    -- VETERANO envia convite para ELITE
    INSERT INTO confraternity_invites (sender_id, receiver_id, status, message, proposed_date)
    VALUES (v_veterano_id, v_elite_id, 'pending', 'Vamos fazer networking!', now() + interval '7 days');
    RAISE NOTICE 'Convite 2 enviado: Veterano -> Elite';
    
    -- Incrementar contador
    PERFORM increment_confraternity_count(v_veterano_id);
    
    -- VERIFICAR SE VETERANO ATINGIU LIMITE
    SELECT check_confraternity_limit(v_veterano_id) INTO v_can_send;
    RAISE NOTICE 'Veterano pode enviar 3º convite? % (esperado: FALSE)', v_can_send;

    RAISE NOTICE '';
    RAISE NOTICE '=== TESTE 3: ACEITAR CONVITE ===';
    
    -- RECRUTA aceita convite do VETERANO
    UPDATE confraternity_invites 
    SET status = 'accepted', accepted_at = now()
    WHERE sender_id = v_veterano_id AND receiver_id = v_recruta_id;
    RAISE NOTICE 'Convite aceito por Recruta';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TESTE 4: RECUSAR CONVITE ===';
    
    -- ELITE recusa convite do VETERANO
    UPDATE confraternity_invites 
    SET status = 'rejected'
    WHERE sender_id = v_veterano_id AND receiver_id = v_elite_id;
    RAISE NOTICE 'Convite recusado por Elite';

    RAISE NOTICE '';
    RAISE NOTICE '=== TESTE 5: COMPLETAR CONFRATERNIZAÇÃO ===';
    
    -- Marcar convite como completado
    UPDATE confraternity_invites 
    SET status = 'completed', completed_at = now()
    WHERE sender_id = v_veterano_id AND receiver_id = v_recruta_id;
    
    -- Criar registro de confraternização realizada
    INSERT INTO confraternities (
        invite_id,
        member1_id,
        member2_id,
        date_occurred,
        location,
        description,
        visibility
    ) VALUES (
        (SELECT id FROM confraternity_invites WHERE sender_id = v_veterano_id AND receiver_id = v_recruta_id),
        v_veterano_id,
        v_recruta_id,
        now(),
        'Café Central - Maringá',
        'Ótima conversa sobre negócios!',
        'public'
    );
    RAISE NOTICE 'Confraternização registrada!';
END $$;

-- ====================================
-- PARTE 2: VERIFICAR RESULTADOS
-- ====================================

SELECT 
    '=== CONVITES ENVIADOS ===' as titulo;

SELECT 
    p1.full_name as remetente,
    p2.full_name as destinatario,
    ci.status,
    ci.message,
    ci.created_at
FROM confraternity_invites ci
JOIN profiles p1 ON p1.id = ci.sender_id
JOIN profiles p2 ON p2.id = ci.receiver_id
ORDER BY ci.created_at DESC;

SELECT 
    '=== LIMITES UTILIZADOS ===' as titulo;

SELECT 
    p.full_name,
    p.subscription_tier as plano,
    cl.invites_sent as convites_enviados,
    CASE p.subscription_tier
        WHEN 'recruta' THEN 0
        WHEN 'veterano' THEN 2
        WHEN 'elite' THEN 10
    END as limite_maximo
FROM confraternity_limits cl
JOIN profiles p ON p.id = cl.user_id
WHERE p.email LIKE '%.teste@rotabusiness.com'
ORDER BY p.email;

SELECT 
    '=== CONFRATERNIZAÇÕES REALIZADAS ===' as titulo;

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
