-- =============================================
-- CRIAR CONTAS DE TESTE COM PLANOS
-- =============================================
-- Cria 3 usuários: Recruta, Veterano e Elite
-- Senha padrão: Teste@2024

-- =============================================
-- PASSO 1: Criar usuários no auth.users
-- =============================================
-- IMPORTANTE: Execute isso MANUALMENTE via Supabase Dashboard > Authentication > Add User
-- Ou use o endpoint de signup da aplicação

-- Recruta: recruta@teste.com / Teste@2024
-- Veterano: veterano@teste.com / Teste@2024  
-- Elite: elite@teste.com / Teste@2024

-- =============================================
-- PASSO 2: Confirmar emails e criar perfis
-- =============================================

DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
BEGIN
    -- Buscar IDs dos usuários (se já foram criados)
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@teste.com';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@teste.com';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@teste.com';
    
    -- Confirmar emails
    IF v_recruta_id IS NOT NULL THEN
        UPDATE auth.users SET email_confirmed_at = now() WHERE id = v_recruta_id;
        
        -- Deletar perfil se existir
        DELETE FROM public.profiles WHERE id = v_recruta_id;
        
        -- Criar perfil RECRUTA
        INSERT INTO public.profiles (
            id, email, full_name, cpf, role, verification_status
        ) VALUES (
            v_recruta_id,
            'recruta@teste.com',
            'Usuário Recruta',
            '11111111111',
            'user',
            'verified'
        );
        
        RAISE NOTICE '✅ Conta RECRUTA criada e confirmada';
    ELSE
        RAISE NOTICE '⚠️  Usuário recruta@teste.com não existe. Crie via /auth/register primeiro.';
    END IF;
    
    IF v_veterano_id IS NOT NULL THEN
        UPDATE auth.users SET email_confirmed_at = now() WHERE id = v_veterano_id;
        
        DELETE FROM public.profiles WHERE id = v_veterano_id;
        
        -- Criar perfil VETERANO
        INSERT INTO public.profiles (
            id, email, full_name, cpf, role, verification_status
        ) VALUES (
            v_veterano_id,
            'veterano@teste.com',
            'Usuário Veterano',
            '22222222222',
            'user',
            'verified'
        );
        
        RAISE NOTICE '✅ Conta VETERANO criada e confirmada';
    ELSE
        RAISE NOTICE '⚠️  Usuário veterano@teste.com não existe. Crie via /auth/register primeiro.';
    END IF;
    
    IF v_elite_id IS NOT NULL THEN
        UPDATE auth.users SET email_confirmed_at = now() WHERE id = v_elite_id;
        
        DELETE FROM public.profiles WHERE id = v_elite_id;
        
        -- Criar perfil ELITE
        INSERT INTO public.profiles (
            id, email, full_name, cpf, role, verification_status
        ) VALUES (
            v_elite_id,
            'elite@teste.com',
            'Usuário Elite',
            '33333333333',
            'user',
            'verified'
        );
        
        RAISE NOTICE '✅ Conta ELITE criada e confirmada';
    ELSE
        RAISE NOTICE '⚠️  Usuário elite@teste.com não existe. Crie via /auth/register primeiro.';
    END IF;
END $$;

-- =============================================
-- VERIFICAR CONTAS CRIADAS
-- =============================================
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.verification_status,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email IN ('recruta@teste.com', 'veterano@teste.com', 'elite@teste.com')
ORDER BY p.email;
