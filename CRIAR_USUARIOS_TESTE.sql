-- ============================================
-- CRIAR USUÁRIOS DE TESTE - VERSÃO COMPLETA
-- ============================================

-- Deletar se já existirem
DELETE FROM auth.users WHERE email IN ('recruta@rotatest.com', 'veterano@rotatest.com', 'elite@rotatest.com');

-- 1. CRIAR USUÁRIO RECRUTA
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'recruta@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Recruta Teste","cpf":"123.456.789-09"}',
    false,
    false,
    now(),
    now()
);

-- 2. CRIAR USUÁRIO VETERANO
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'veterano@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Veterano Teste","cpf":"987.654.321-00"}',
    false,
    false,
    now(),
    now()
);

-- 3. CRIAR USUÁRIO ELITE
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'elite@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elite Teste","cpf":"111.444.777-35"}',
    false,
    false,
    now(),
    now()
);

-- ============================================
-- VERIFICAR SE FUNCIONOU
-- ============================================

SELECT 
    u.email,
    u.aud,
    u.role,
    p.full_name,
    p.cpf,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.confirmed_at IS NOT NULL as conta_confirmada,
    u.encrypted_password IS NOT NULL as tem_senha
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('recruta@rotatest.com', 'veterano@rotatest.com', 'elite@rotatest.com')
ORDER BY u.email;
