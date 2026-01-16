-- =============================================
-- 🚀 SOLUÇÃO COMPLETA - VERSÃO SAFE (SEM PISTA)
-- =============================================

-- =============================================
-- PASSO 1: CRIAR TRIGGER AUTOMÁTICO
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        cpf,
        role,
        rota_number,
        verification_status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'rota_number',
        'pending'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating profile: %', SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PASSO 2: CRIAR PERFIS DOS 3 USUÁRIOS
-- =============================================
DO $$
DECLARE
    v_recruta_id uuid;
    v_veterano_id uuid;
    v_elite_id uuid;
BEGIN
    -- Buscar IDs
    SELECT id INTO v_recruta_id FROM auth.users WHERE email = 'recruta@rotabusiness.com.br';
    SELECT id INTO v_veterano_id FROM auth.users WHERE email = 'veterano@rotabusiness.com.br';
    SELECT id INTO v_elite_id FROM auth.users WHERE email = 'elite@rotabusiness.com.br';
    
    -- RECRUTA
    IF v_recruta_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_recruta_id;
        INSERT INTO public.profiles (id, email, full_name, cpf, role, verification_status, rota_number)
        VALUES (v_recruta_id, 'recruta@rotabusiness.com.br', 'Usuario Recruta', '11111111111', 'user', 'verified', 'ROT-001');
        RAISE NOTICE '✅ Recruta criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário recruta não encontrado';
    END IF;
    
    -- VETERANO
    IF v_veterano_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_veterano_id;
        INSERT INTO public.profiles (id, email, full_name, cpf, role, verification_status, rota_number)
        VALUES (v_veterano_id, 'veterano@rotabusiness.com.br', 'Usuario Veterano', '22222222222', 'user', 'verified', 'ROT-002');
        RAISE NOTICE '✅ Veterano criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário veterano não encontrado';
    END IF;
    
    -- ELITE
    IF v_elite_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = v_elite_id;
        INSERT INTO public.profiles (id, email, full_name, cpf, role, verification_status, rota_number)
        VALUES (v_elite_id, 'elite@rotabusiness.com.br', 'Usuario Elite', '33333333333', 'user', 'verified', 'ROT-003');
        RAISE NOTICE '✅ Elite criado';
    ELSE
        RAISE NOTICE '⚠️  Usuário elite não encontrado';
    END IF;
END $$;

-- =============================================
-- PASSO 3: CONFIRMAR EMAILS
-- =============================================
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
);

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
SELECT 
    '✅ RESULTADO' as status,
    p.email,
    p.full_name,
    p.role,
    p.rota_number,
    p.verification_status,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email OK' ELSE '❌ Email pendente' END as email_status
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email LIKE '%rotabusiness.com.br'
ORDER BY p.email;
