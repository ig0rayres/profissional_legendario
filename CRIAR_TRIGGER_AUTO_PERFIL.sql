-- =============================================
-- CRIAR TRIGGER AUTOMÁTICO PARA NOVOS USUÁRIOS
-- =============================================
-- Este trigger cria automaticamente um perfil em public.profiles
-- quando um novo usuário é criado em auth.users

-- PASSO 1: Deletar função e trigger antigos se existirem
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASSO 2: Criar função melhorada
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
        pista,
        rota_number,
        verification_status,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'pista', 'maringa'),
        NEW.raw_user_meta_data->>'rota_number',
        'pending',
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating profile for user %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- PASSO 3: Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASSO 4: Verificar se foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

RAISE NOTICE '';
RAISE NOTICE '✅ Trigger criado com sucesso!';
RAISE NOTICE 'Agora todos os novos registros criarão perfis automaticamente.';
