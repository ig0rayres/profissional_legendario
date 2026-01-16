-- ============================================
-- CRIAR USUÁRIO ADMIN - MÉTODO ALTERNATIVO
-- Se o método anterior não funcionou, use este
-- ============================================

-- Primeiro, LIMPAR qualquer usuário anterior
DELETE FROM public.profiles WHERE email = 'admin@rotaclub.com';
DELETE FROM auth.users WHERE email = 'admin@rotaclub.com';

-- Agora criar usando o método do Supabase Dashboard
-- OPÇÃO 1: Use o Supabase Dashboard
-- Vá em Authentication → Add User → Email
-- Email: admin@rotaclub.com  
-- Password: Admin@2024
-- Auto Confirm: YES

-- Depois execute este UPDATE para tornar admin:
-- UPDATE public.profiles 
-- SET role = 'admin', verification_status = 'verified'
-- WHERE email = 'admin@rotaclub.com';

-- ============================================
-- OPÇÃO 2: Criar via SQL Editor (mais simples)
-- ============================================

-- Usar a extensão do Supabase para criar usuário
SELECT auth.sign_up(
    json_build_object(
        'email', 'admin@rotaclub.com',
        'password', 'Admin@2024',
        'email_confirm', true,
        'user_metadata', json_build_object(
            'full_name', 'Administrador',
            'cpf', '00000000000',
            'role', 'admin'
        )
    )::json
);

-- Atualizar o perfil para admin
UPDATE public.profiles 
SET 
    role = 'admin',
    verification_status = 'verified'
WHERE email = 'admin@rotaclub.com';
