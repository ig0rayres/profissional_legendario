-- VERIFICAR PROFILES COM NOMES
-- Execute no Supabase SQL Editor

SELECT 
    id,
    email,
    full_name,
    role
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;
