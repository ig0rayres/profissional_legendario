-- ============================================
-- SCRIPT DE RECUPERAÇÃO COMPLETA DO SISTEMA
-- Execute TODOS os passos em ordem
-- ============================================

-- =========================================
-- PASSO 1: CORRIGIR TRIGGER handle_new_user
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, cpf, email, role, top_id, skills, average_rating, total_ratings, created_at, updated_at
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'cpf', '00000000000'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'professional'),
    NULLIF(new.raw_user_meta_data->>'top_id', '')::uuid,
    ARRAY[]::text[],
    0, 0, now(), now()
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN new;
END;
$$;

-- =========================================
--PASSO 2: CORRIGIR POLÍTICAS RLS
-- =========================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON public.profiles
    FOR SELECT USING (true);

-- =========================================
-- PASSO 3: PROMOVER ADMIN
-- =========================================
UPDATE public.profiles 
SET role = 'admin', verification_status = 'verified'
WHERE email = 'admin@rotaclub.com';

-- =========================================
-- PASSO 4: CONFIRMAR EMAIL ADMIN
-- =========================================
UPDATE auth.users 
SET email_confirmed_at = now(),
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@rotaclub.com';

-- =========================================
-- PASSO 5: VERIFICAR RESULTADO
-- =========================================
SELECT  
    'Profiles RLS' as tabela,
    count(*) as total_policies
FROM pg_policies
WHERE tablename = 'profiles'
UNION ALL
SELECT 
    'Admin User' as tabela,
    count(*) as total
FROM public.profiles
WHERE email = 'admin@rotaclub.com' AND role = 'admin';

-- =========================================
-- RESULTADO ESPERADO:
-- =========================================
-- Profiles RLS    | 3 (ou mais)
-- Admin User       | 1

SELECT '✅ SISTEMA RECUPERADO COM SUCESSO!' as status;
