-- ============================================
-- RESETAR SENHA DO ADMIN
-- Execute este script para corrigir a senha
-- ============================================

-- Atualizar a senha do usuário admin
UPDATE auth.users
SET 
    encrypted_password = crypt('Admin@2024', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'admin@rotaclub.com';

-- Verificar se atualizou
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'admin@rotaclub.com';
