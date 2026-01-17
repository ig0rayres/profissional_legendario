-- =============================================
-- VERIFICAR E LIMPAR REGISTRO ÓRFÃO
-- =============================================

-- 1. Ver se o registro ainda existe
SELECT 
    id,
    email,
    full_name,
    rota_number,
    created_at
FROM public.profiles
WHERE email = 'zmb4fun@gmail.com'
   OR rota_number = '88888';

-- 2. Ver se existe em auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'zmb4fun@gmail.com';

-- 3. DELETAR TUDO relacionado a esse email/rota_number
-- Subscriptions
DELETE FROM public.subscriptions
WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE email = 'zmb4fun@gmail.com' OR rota_number = '88888'
);

-- Gamification
DELETE FROM public.user_gamification
WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE email = 'zmb4fun@gmail.com' OR rota_number = '88888'
);

-- Medals
DELETE FROM public.user_medals
WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE email = 'zmb4fun@gmail.com' OR rota_number = '88888'
);

-- Profile
DELETE FROM public.profiles
WHERE email = 'zmb4fun@gmail.com' OR rota_number = '88888';

-- Auth user (Se tiver permissão)
-- Pode precisar fazer pelo Dashboard do Supabase → Authentication → Users

-- 4. Verificar que foi deletado
SELECT COUNT(*) as restante
FROM public.profiles
WHERE email = 'zmb4fun@gmail.com' OR rota_number = '88888';
-- Deve retornar 0
