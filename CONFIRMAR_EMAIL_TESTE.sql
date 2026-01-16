-- =============================================
-- CONFIRMAR EMAIL DO USUÁRIO TESTE
-- =============================================
-- Execute este script para permitir login sem verificação de email

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'teste@teste.com';

-- Verificar
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'teste@teste.com';
