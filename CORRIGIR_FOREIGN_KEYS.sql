-- =============================================
-- CORRIGIR FOREIGN KEY DE SUBSCRIPTIONS
-- =============================================

-- 1. Dropar constraint antiga se existir
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- 2. Adicionar foreign key correta
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. Fazer o mesmo para user_gamification
ALTER TABLE public.user_gamification 
DROP CONSTRAINT IF EXISTS user_gamification_user_id_fkey;

ALTER TABLE public.user_gamification
ADD CONSTRAINT user_gamification_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 4. Verificar se foi criado
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('subscriptions', 'user_gamification')
ORDER BY tc.table_name;
