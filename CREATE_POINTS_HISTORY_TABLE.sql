-- =====================================================
-- TABELA DE HISTÓRICO DE PONTOS (VIGOR)
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Criar tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_action_type ON points_history(action_type);

-- 3. Comentários
COMMENT ON TABLE points_history IS 'Histórico detalhado de todas as transações de pontos (Vigor)';
COMMENT ON COLUMN points_history.action_type IS 'Tipo da ação: elo_sent, elo_accepted, confraternity_completed, portfolio_upload, etc.';
COMMENT ON COLUMN points_history.metadata IS 'Dados extras como ID do outro usuário, multiplicador aplicado, etc.';

-- 4. RLS Policies
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver seu próprio histórico
DROP POLICY IF EXISTS "Users can view own points history" ON points_history;
CREATE POLICY "Users can view own points history"
ON points_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Sistema pode inserir histórico para qualquer usuário
DROP POLICY IF EXISTS "Anyone authenticated can insert points history" ON points_history;
CREATE POLICY "Anyone authenticated can insert points history"
ON points_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Verificar criação
SELECT 'Tabela points_history criada com sucesso!' as resultado;

-- 6. Mostrar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'points_history'
ORDER BY ordinal_position;
