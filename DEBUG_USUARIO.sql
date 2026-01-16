-- ============================================
-- TESTAR SENHA DO USUÁRIO RECRUTA
-- ============================================

-- Ver detalhes do usuário
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    aud,
    role
FROM auth.users 
WHERE email = 'recruta@rotatest.com';

-- Verificar se há mais campos necessários
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;
