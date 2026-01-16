-- ============================================
-- SINCRONIZAR METADADOS DO TOKEN JWT
-- Atualiza o metadata para o token incluir role admin
-- ============================================

-- Atualizar metadata do usuário no auth.users
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'admin@rotaclub.com';

-- Verificar
SELECT 
    email,
    raw_user_meta_data->>'role' as metadata_role,
    email_confirmed_at
FROM auth.users 
WHERE email = 'admin@rotaclub.com';
