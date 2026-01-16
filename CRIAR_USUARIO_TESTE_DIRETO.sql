-- =============================================
-- CRIAR USUÁRIO DE TESTE DIRETO NO BANCO
-- =============================================
-- Cria usuário com email já confirmado (sem enviar email)

-- 1. Criar usuário em auth.users
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
    'teste@rotabusiness.com.br',
    crypt('senha123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
        'full_name', 'Teste Silva',
        'cpf', '123.456.789-00',
        'pista', 'São Paulo',
        'plan', 'recruta',
        'rota_number', '99999'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
RETURNING id, email;

-- 2. O trigger handle_new_user() deve criar automaticamente:
-- - Profile em public.profiles
-- - Subscription em public.subscriptions (plano recruta)
-- - Gamification em public.user_gamification (novato, 0 pts)

-- 3. Verificar se foi criado
SELECT 
    au.email,
    p.full_name,
    p.rota_number,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
WHERE au.email = 'teste@rotabusiness.com.br';
