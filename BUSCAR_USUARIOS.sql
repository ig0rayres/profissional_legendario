-- BUSCAR USUÁRIOS REAIS
SELECT id, full_name, slug, email 
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;
