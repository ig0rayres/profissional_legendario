-- ============================================
-- CONFIRMAR EMAIL DO ADMIN
-- Execute para permitir o login
-- ============================================

UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'admin@rotaclub.com';

-- Verificar
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'admin@rotaclub.com';
