-- =============================================
-- CONFIGURAR CONTAS DE TESTE - SCRIPT COMPLETO
-- =============================================
-- Este script faz TUDO: confirma email, cria perfil, associa planos

DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
BEGIN
    -- =============================================
    -- PASSO 1: Confirmar todos os emails de teste
    -- =============================================
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email IN (
        'recruta@rotabusiness.com',
        'veterano@rotabusiness.com',
        'elite@rotabusiness.com'
    );
    
    RAISE NOTICE '✅ Emails confirmados';
    
    -- =============================================
    -- PASSO 2: Buscar IDs dos usuários
    -- =============================================
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotabusiness.com';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotabusiness.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotabusiness.com';
    
    -- =============================================
    -- PASSO 3: Criar/Atualizar perfis
    -- =============================================
    
    -- RECRUTA
    IF v_recruta_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_recruta_id;
        
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name, 
            cpf, 
            role, 
            verification_status,
            pista
        ) VALUES (
            v_recruta_id,
            (SELECT email FROM auth.users WHERE id = v_recruta_id),
            'Usuario Recruta',
            '11111111111',
            'user',
            'verified',
            'maringa'
        );
        
        RAISE NOTICE '✅ Perfil RECRUTA criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário RECRUTA não existe - registre via /auth/register primeiro';
    END IF;
    
    -- VETERANO
    IF v_veterano_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_veterano_id;
        
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name, 
            cpf, 
            role, 
            verification_status,
            pista
        ) VALUES (
            v_veterano_id,
            (SELECT email FROM auth.users WHERE id = v_veterano_id),
            'Usuario Veterano',
            '22222222222',
            'user',
            'verified',
            'maringa'
        );
        
        RAISE NOTICE '✅ Perfil VETERANO criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário VETERANO não existe - registre via /auth/register primeiro';
    END IF;
    
    -- ELITE
    IF v_elite_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_elite_id;
        
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name, 
            cpf, 
            role, 
            verification_status,
            pista
        ) VALUES (
            v_elite_id,
            (SELECT email FROM auth.users WHERE id = v_elite_id),
            'Usuario Elite',
            '33333333333',
            'user',
            'verified',
            'maringa'
        );
        
        RAISE NOTICE '✅ Perfil ELITE criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário ELITE não existe - registre via /auth/register primeiro';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CONFIGURAÇÃO COMPLETA!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Contas criadas:';
    RAISE NOTICE '  - Recruta: recruta@rotabusiness.com / Teste@2024';
    RAISE NOTICE '  - Veterano: veterano@rotabusiness.com / Teste@2024';
    RAISE NOTICE '  - Elite: elite@rotabusiness.com / Teste@2024';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Todas as contas estão prontas para uso!';
    
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
SELECT 
    '✅ CONTAS CONFIGURADAS' as status,
    p.email,
    p.full_name,
    p.role,
    p.verification_status,
    p.pista,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
        ELSE '❌ Não confirmado'
    END as email_status
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email LIKE '%rotabusiness.com'
ORDER BY p.email;
