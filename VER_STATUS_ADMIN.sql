-- Ver usuário admin completo
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'admin@rotaclub.com';

-- Ver se tem profile
SELECT 
    au.email,
    p.id IS NOT NULL as tem_profile,
    p.full_name,
    p.role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'admin@rotaclub.com';
