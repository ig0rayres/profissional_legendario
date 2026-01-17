-- =============================================
-- VERIFICAR AUTOMAÇÃO DE CRIAÇÃO DE PERFIS
-- =============================================

-- 1. Ver se trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Ver function do trigger
SELECT pg_get_functiondef(oid)
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Verificar se todos usuários têm perfil
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users

UNION ALL

SELECT 
    'profiles' as tabela,
    COUNT(*) as total
FROM profiles;

-- Devem ter o mesmo número!

-- 4. Ver IDs dos usuários de teste para criar URLs
SELECT 
    id,
    email,
    full_name,
    '/professional/' || id as url_perfil
FROM profiles
WHERE email LIKE '%rotabusiness.com.br%'
ORDER BY email;

-- 5. Verificar se trigger cria tudo automaticamente
SELECT 
    p.email,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as perfil,
    CASE WHEN s.user_id IS NOT NULL THEN '✅' ELSE '❌' END as subscription,
    CASE WHEN ug.user_id IS NOT NULL THEN '✅' ELSE '❌' END as gamification
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN subscriptions s ON s.user_id = au.id
LEFT JOIN user_gamification ug ON ug.user_id = au.id
WHERE au.email LIKE '%rotabusiness.com.br%'
ORDER BY au.email;
