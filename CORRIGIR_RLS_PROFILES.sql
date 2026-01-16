-- ============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA PROFILES
-- O problema é que nenhum usuário consegue ler seu próprio perfil
-- ============================================

-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Criar política PERMISSIVA para leitura do próprio perfil
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Criar política para atualização do próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Permitir que todos vejam perfis públicos (para marketplace, etc)
CREATE POLICY "Public profiles are viewable" ON public.profiles
    FOR SELECT
    USING (true);

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';
