-- ============================================
-- DIAGNÓSTICO: Verificar usuário admin
-- Execute este script para ver o que está acontecendo
-- ============================================

-- 1. Verificar se o usuário foi criado na tabela auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'admin@rotaclub.com';

-- 2. Verificar se o perfil foi criado em public.profiles
SELECT 
    id,
    email,
    full_name,
    cpf,
    role,
    verification_status,
    created_at
FROM public.profiles 
WHERE email = 'admin@rotaclub.com';

-- 3. Se o usuário existir, deletar e tentar novamente
-- DESCOMENTE AS LINHAS ABAIXO APENAS SE QUISER LIMPAR E RECRIAR:
-- DELETE FROM public.profiles WHERE email = 'admin@rotaclub.com';
-- DELETE FROM auth.users WHERE email = 'admin@rotaclub.com';
