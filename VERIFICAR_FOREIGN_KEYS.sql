-- =============================================
-- VERIFICAR E CORRIGIR FOREIGN KEYS
-- =============================================

-- 1. Ver foreign keys existentes
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('subscriptions', 'user_gamification')
ORDER BY tc.table_name;

-- 2. Tentar query simples sem joins
SELECT 
    id,
    email,
    full_name,
    role
FROM public.profiles
WHERE email LIKE '%rotabusiness.com.br%'
ORDER BY created_at DESC;

-- 3. Ver se subscriptions tem dados
SELECT 
    s.user_id,
    p.email,
    s.plan_id
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.user_id
WHERE p.email LIKE '%rotabusiness.com.br%';

-- 4. Ver estrutura da tabela subscriptions
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;
