-- SISTEMA DE FEED DE ATIVIDADES SOCIAIS
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela social_activities existe
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'social_activities';

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS social_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true, -- Aparece no feed global
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_type ON social_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_social_activities_created ON social_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_activities_public ON social_activities(is_public) WHERE is_public = true;

-- 4. Habilitar RLS
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;

-- 5. Política para visualização - Todos podem ver atividades públicas
DROP POLICY IF EXISTS "Public activities are viewable by all" ON social_activities;
CREATE POLICY "Public activities are viewable by all"
ON social_activities FOR SELECT
USING (is_public = true OR user_id = auth.uid());

-- 6. Política para inserção - Sistema pode inserir para qualquer usuário
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON social_activities;
CREATE POLICY "Authenticated users can insert activities"
ON social_activities FOR INSERT
TO authenticated
WITH CHECK (true);

-- 7. Verificar badges existentes
SELECT * FROM badges LIMIT 20;

-- 8. Ver estrutura da tabela badges
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'badges';

-- 9. Criar badge de primeira confraria (ajustar conforme estrutura)
-- INSERT INTO badges (id, name, description, category, xp_reward, icon_key)
-- VALUES ('primeira_confraria', 'Primeira Confraria', 'Participou da primeira confraria', 'social', 25, 'coffee')
-- ON CONFLICT (id) DO NOTHING;
