-- =============================================
-- LIMPAR SUBSCRIPTIONS ÓRFÃS E CRIAR FOREIGN KEYS
-- =============================================

-- 1. Ver quantas subscriptions órfãs existem
SELECT COUNT(*) as subscriptions_orfas
FROM public.subscriptions s
LEFT JOIN public.profiles p ON p.id = s.user_id
WHERE p.id IS NULL;

-- 2. Deletar subscriptions órfãs
DELETE FROM public.subscriptions
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 3. Ver quantas user_gamification órfãs existem
SELECT COUNT(*) as gamification_orfas
FROM public.user_gamification ug
LEFT JOIN public.profiles p ON p.id = ug.user_id
WHERE p.id IS NULL;

-- 4. Deletar user_gamification órfãs
DELETE FROM public.user_gamification
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 5. Agora criar foreign keys
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_gamification 
DROP CONSTRAINT IF EXISTS user_gamification_user_id_fkey;

ALTER TABLE public.user_gamification
ADD CONSTRAINT user_gamification_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 6. Verificar
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
