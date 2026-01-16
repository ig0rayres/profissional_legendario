-- Testar se o hash está correto
SELECT 
    email,
    encrypted_password = crypt('123456', encrypted_password) as senha_bate,
    length(encrypted_password) as tamanho_hash
FROM auth.users 
WHERE email = 'recruta@rotatest.com';

-- Se senha_bate = true, então a senha está correta no banco
-- Se false, tem problema no hash
