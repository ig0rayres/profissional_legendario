-- =============================================
-- VERIFICAR TRIGGER handle_new_user
-- =============================================

-- Verificar se a função existe
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar usuários sem perfil
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        ELSE '✅ TEM PERFIL'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
