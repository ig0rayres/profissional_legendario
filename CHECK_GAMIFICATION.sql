-- VERIFICAR ESTRUTURA DE GAMIFICAÇÃO
-- Execute no Supabase SQL Editor

-- Ver tabelas relacionadas
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE '%gamif%' OR table_name LIKE '%xp%' OR table_name LIKE '%badge%';

-- Ver se a função add_user_xp existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'add_user_xp';

-- Ver estrutura da tabela user_gamification
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_gamification';

-- Ver XP atual do usuário Elite
SELECT ug.*, p.full_name 
FROM user_gamification ug
JOIN profiles p ON p.id = ug.user_id
WHERE p.full_name LIKE '%Elite%';
