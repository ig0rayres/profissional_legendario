-- =============================================
-- DIAGNÓSTICO RÁPIDO - PROBLEMA DE LOGIN
-- =============================================

-- 1. Verificar se usuários existem
SELECT 
    'AUTH.USERS' as tabela,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmados
FROM auth.users;

-- 2. Ver se há usuários sem email confirmado
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ NÃO CONFIRMADO'
        ELSE '✅ CONFIRMADO'
    END as status
FROM auth.users
WHERE email IN (
    'admin@rotaclub.com',
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY email;

-- 3. Verificar Confirm Email no Supabase
-- Vá em: Authentication → Providers → Email
-- Verifique se "Confirm email" está DESLIGADO

-- 4. Se confirmar email está ligado, confirme todos:
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 5. Verificar contagem final
SELECT 
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmados,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as nao_confirmados,
    COUNT(*) as total
FROM auth.users;
