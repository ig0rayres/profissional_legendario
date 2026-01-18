-- VERIFICAR COLUNAS DA TABELA RANKS
-- Execute no Supabase SQL Editor

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ranks'
ORDER BY ordinal_position;

-- Ver dados existentes
SELECT * FROM ranks LIMIT 5;
