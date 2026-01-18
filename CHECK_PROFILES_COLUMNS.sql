-- VERIFICAR COLUNAS DA TABELA PROFILES
-- Execute no Supabase SQL Editor

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
