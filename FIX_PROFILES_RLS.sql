-- =============================================
-- VERIFICAR E CORRIGIR RLS PARA PROFILES PÚBLICOS
-- =============================================

-- Verificar políticas existentes
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Adicionar política para SELECT público (perfis são públicos)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Verificar se há perfis com rota_number
SELECT id, full_name, rota_number 
FROM profiles 
WHERE rota_number IS NOT NULL 
LIMIT 10;
