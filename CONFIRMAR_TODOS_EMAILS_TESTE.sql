-- =============================================
-- CONFIRMAR EMAILS DAS CONTAS DE TESTE
-- =============================================

-- Confirmar todas as contas de teste de uma vez
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN (
    'recruta@rotatest.com',
    'veterano@rotatest.com',
    'elite@rotatest.com',
    'recruta@teste.com',
    'veterano@teste.com',
    'elite@teste.com',
    'teste@teste.com'
);

-- Verificar quais foram confirmados
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email LIKE '%test%' OR email LIKE '%rotatest%'
ORDER BY email;
