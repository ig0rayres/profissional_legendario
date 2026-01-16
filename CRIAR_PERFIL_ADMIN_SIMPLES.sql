-- =============================================
-- CRIAR PERFIL ADMIN - SCRIPT FINAL SIMPLIFICADO
-- =============================================

-- Buscar o ID do usuário admin que JÁ existe no auth.users  
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Pegar o ID do usuário admin
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'admin@rotaclub.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário admin@rotaclub.com não encontrado!';
    END IF;
    
    -- Deletar perfil se já existir
    DELETE FROM public.profiles WHERE id = v_user_id;
    
    -- Criar perfil admin
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        cpf,
        role,
        verification_status,
        average_rating,
        total_ratings,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'admin@rotaclub.com',
        'Administrador',
        '00000000000',
        'admin',
        'verified',
        0,
        0,
        now(),
        now()
    );
    
    RAISE NOTICE '✅ Perfil admin criado com sucesso!';
    RAISE NOTICE 'ID: %', v_user_id;
END $$;

-- Verificar
SELECT 
    id,
    email,
    full_name,
    role,
    verification_status
FROM public.profiles
WHERE email = 'admin@rotaclub.com';
