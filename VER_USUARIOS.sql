-- Ver se a primeira conta foi criada
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
