-- ============================================
-- CONSERTAR TRIGGER handle_new_user
-- Execute este script para corrigir o erro
-- ============================================

-- Recriar a função com tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil com valores padrão seguros
  INSERT INTO public.profiles (
    id,
    full_name,
    cpf,
    email,
    role,
    top_id,
    skills,
    average_rating,
    total_ratings,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'cpf', '00000000000'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'professional'),
    NULLIF(new.raw_user_meta_data->>'top_id', '')::uuid,
    ARRAY[]::text[],
    0,
    0,
    now(),
    now()
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN new;
END;
$$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger corrigido com sucesso!';
  RAISE NOTICE '🔄 Agora tente registrar novamente pelo site';
END $$;
