-- ============================================
-- PROMOVER USUÁRIO A ADMIN
-- Execute este script para dar permissões de admin
-- ============================================

UPDATE public.profiles 
SET 
    role = 'admin',
    verification_status = 'verified'
WHERE email = 'admin@rotaclub.com';

-- Verificar se funcionou
SELECT 
    id,
    email,
    full_name,
    role,
    verification_status
FROM public.profiles 
WHERE email = 'admin@rotaclub.com';
