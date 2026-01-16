-- ============================================
-- CONFIRMAR EMAILS DAS 3 CONTAS OFICIAIS
-- Execute APÓS cadastrar as 3 contas pelo site
-- ============================================

UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email IN (
    'recruta.teste@rotabusiness.com',
    'veterano.teste@rotabusiness.com',
    'elite.teste@rotabusiness.com'
);

-- Verificar se foram confirmadas
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmado,
    created_at
FROM auth.users 
WHERE email IN (
    'recruta.teste@rotabusiness.com',
    'veterano.teste@rotabusiness.com',
    'elite.teste@rotabusiness.com'
)
ORDER BY email;

-- Resultado esperado: 3 usuários com confirmado = true
