-- Testar se a senha está correta
SELECT 
    email,
    encrypted_password = crypt('Rota@2024', encrypted_password) as senha_valida
FROM auth.users 
WHERE email = 'recruta@rotatest.com';

-- Ver hash da senha
SELECT 
    email,
    substring(encrypted_password, 1, 20) as primeiros_chars_hash
FROM auth.users 
WHERE email = 'recruta@rotatest.com';
