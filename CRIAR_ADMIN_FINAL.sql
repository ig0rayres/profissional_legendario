-- ============================================
-- MÉTODO MAIS SIMPLES - TUDO EM UM SCRIPT
-- Cria admin sem depender do trigger
-- ============================================

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Desabilitar trigger
    EXECUTE 'ALTER TABLE auth.users DISABLE TRIGGER ALL';
    
    -- Limpar se existir
    DELETE FROM public.profiles WHERE email = 'admin@rotaclub.com';
    DELETE FROM auth.users WHERE email = 'admin@rotaclub.com';
    
    -- Gerar ID
    v_user_id := gen_random_uuid();
    
    -- Criar usuário
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'admin@rotaclub.com',
        crypt('Admin@2024', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
    
    -- Criar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        cpf,
        role,
        verification_status,
        skills,
        average_rating,
        total_ratings,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'admin@rotaclub.com',
        'Administrador',
        '00000000000',
        'admin',
        'verified',
        ARRAY[]::text[],
        0,
        0,
        now(),
        now()
    );
    
    -- Reabilitar trigger
    EXECUTE 'ALTER TABLE auth.users ENABLE TRIGGER ALL';
    
    RAISE NOTICE '✅ Admin criado com sucesso!';
    RAISE NOTICE '📧 Email: admin@rotaclub.com';
    RAISE NOTICE '🔑 Senha: Admin@2024';
    RAISE NOTICE '🆔 ID: %', v_user_id;
END $$;

-- Verificar
SELECT id, email, full_name, role FROM public.profiles WHERE email = 'admin@rotaclub.com';
