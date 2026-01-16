-- Confirmar email do usuário (sem tocar em confirmed_at que é gerado automaticamente)
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'final@teste.com';

-- Verificar
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users 
WHERE email = 'final@teste.com';
