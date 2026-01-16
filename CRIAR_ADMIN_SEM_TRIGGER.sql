-- ============================================
-- CRIAR ADMIN - CONTORNANDO TRIGGER QUEBRADO
-- O trigger handle_new_user está causando erro
-- ============================================

-- Passo 1: DESABILITAR o trigger temporariamente
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Passo 2: Limpar usuário se existir
DELETE FROM public.profiles WHERE email = 'admin@rotaclub.com';
DELETE FROM auth.users WHERE email = 'admin@rotaclub.com';

-- Passo 3: Criar usuário na tabela auth.users SEM TRIGGER
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
    gen_random_uuid(),
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
) RETURNING id;

-- Passo 4: Obter o ID do usuário criado e criar perfil MANUALMENTE
-- IMPORTANTE: Copie o ID retornado acima e cole abaixo onde está 'COLE_O_ID_AQUI'
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
    'COLE_O_ID_AQUI'::uuid,  -- SUBSTITUA pelo ID retornado acima
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

-- Passo 5: REABILITAR o trigger
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- Verificar se funcionou
SELECT id, email, role FROM public.profiles WHERE email = 'admin@rotaclub.com';
