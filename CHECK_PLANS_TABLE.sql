-- VERIFICAR TABELA DE PLANOS
-- Execute no Supabase SQL Editor

-- Ver estrutura da tabela plans
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'plans';

-- Ver dados da tabela plans
SELECT * FROM plans;
