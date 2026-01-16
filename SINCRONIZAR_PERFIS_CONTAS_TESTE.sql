-- =============================================
-- SINCRONIZAR PERFIS DAS CONTAS DE TESTE
-- =============================================
-- Cria perfis na tabela profiles para usuários que existem no auth

DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotabusiness.com.br';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotabusiness.com.br';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotabusiness.com.br';
    
    -- RECRUTA
    IF v_recruta_id IS NOT NULL THEN
        -- Deletar se já existir
        DELETE FROM public.profiles WHERE id = v_recruta_id;
        
        -- Criar perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            cpf,
            role,
            verification_status,
            pista,
            rota_number
        ) VALUES (
            v_recruta_id,
            'recruta@rotabusiness.com.br',
            'Usuario Recruta',
            '11111111111',
            'user',
            'verified',
            'maringa',
            'ROT-001'
        );
        
        RAISE NOTICE '✅ Perfil RECRUTA criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário recruta não encontrado - registre via /auth/register';
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
            pista,
            rota_number
        ) VALUES (
            v_veterano_id,
            'veterano@rotabusiness.com.br',
            'Usuario Veterano',
            '22222222222',
            'user',
            'verified',
            'maringa',
            'ROT-002'
        );
        
        RAISE NOTICE '✅ Perfil VETERANO criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário veterano não encontrado - registre via /auth/register';
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
            pista,
            rota_number
        ) VALUES (
            v_elite_id,
            'elite@rotabusiness.com.br',
            'Usuario Elite',
            '33333333333',
            'user',
            'verified',
            'maringa',
            'ROT-003'
        );
        
        RAISE NOTICE '✅ Perfil ELITE criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário elite não encontrado - registre via /auth/register';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Sincronização completa!';
END $$;

-- Verificar resultado
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.rota_number,
    p.verification_status,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY p.email;
