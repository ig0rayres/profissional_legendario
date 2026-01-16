-- Deletar usuários corrompidos
DELETE FROM auth.users 
WHERE email IN ('recruta@rotatest.com', 'veterano@rotatest.com', 'elite@rotatest.com');

-- Verificar se foram deletados
SELECT email FROM auth.users;
