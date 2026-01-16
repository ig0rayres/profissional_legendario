-- =============================================
-- CONFIRMAR EMAILS DAS CONTAS DE TESTE
-- =============================================

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
);

-- Verificar resultado
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY email;
