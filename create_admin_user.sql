-- ============================================
-- CRIAR USUÁRIO ADMIN - VERSÃO 3.0 (CORRIGIDA)
-- Execute este script no Supabase SQL Editor
-- ============================================

-- IMPORTANTE: Este script usa o trigger automático handle_new_user()
-- Email: admin@rotaclub.com
-- Senha: Admin@2024

DO $$
DECLARE
    new_user_id uuid;
    admin_email text := 'admin@rotaclub.com';
BEGIN
    -- Gerar ID único
    new_user_id := gen_random_uuid();
    
    -- Inserir na tabela auth.users
    -- O trigger handle_new_user() vai criar automaticamente o perfil em public.profiles
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        aud,
        role
    ) VALUES (
        new_user_id,
        admin_email,
        crypt('Admin@2024', gen_salt('bf')),
        now(), -- Email já confirmado
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
            'full_name', 'Administrador do Sistema',
            'cpf', '00000000000',
            'role', 'admin'
        ), -- Dados que o trigger vai usar
        now(),
        now(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated'
    );
    
    -- Aguardar o trigger criar o perfil
    -- Agora atualizar o perfil para garantir role admin e status verificado
    UPDATE public.profiles
    SET 
        role = 'admin',
        verification_status = 'verified'
    WHERE id = new_user_id;
    
    RAISE NOTICE '✅ Usuário admin criado com sucesso!';
    RAISE NOTICE '📧 Email: %', admin_email;
    RAISE NOTICE '🔑 Senha: Admin@2024';
    RAISE NOTICE '🆔 ID: %', new_user_id;
    RAISE NOTICE '👤 Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Você já pode fazer login!';
END $$;
