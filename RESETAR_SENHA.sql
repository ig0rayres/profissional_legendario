-- ============================================
-- RESETAR SENHAS DOS 3 USUÁRIOS
-- Senha nova para todos: 123456
-- ============================================

UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email IN ('recruta@rotatest.com', 'veterano@rotatest.com', 'elite@rotatest.com');

-- Verificar
SELECT 
    email,
    updated_at,
    encrypted_password IS NOT NULL as tem_senha
FROM auth.users 
WHERE email IN ('recruta@rotatest.com', 'veterano@rotatest.com', 'elite@rotatest.com')
ORDER BY email;
