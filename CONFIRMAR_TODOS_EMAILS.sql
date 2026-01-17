-- =============================================
-- CONFIRMAR EMAILS DE TODOS USUÁRIOS EXISTENTES
-- =============================================
-- Isso permite que usuários antigos façam login após ativar confirmação

-- 1. Confirmar emails de TODOS os usuários
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Verificar quantos foram atualizados
SELECT 
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmados,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as nao_confirmados
FROM auth.users;

-- 3. Ver todos usuários e status
SELECT 
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
        ELSE '❌ Não confirmado'
    END as status
FROM auth.users
ORDER BY created_at DESC;
