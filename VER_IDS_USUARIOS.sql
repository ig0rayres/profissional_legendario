-- Ver IDs dos usuários de teste
SELECT 
    id,
    email,
    full_name,
    rota_number
FROM profiles
WHERE email LIKE '%rotabusiness.com.br%'
ORDER BY email;
