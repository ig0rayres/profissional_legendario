-- ============================================================================
-- FIX: Adicionar coluna conversation_id se não existir
-- ============================================================================

-- Verificar estrutura da tabela messages
DO $$
BEGIN
  -- Adicionar conversation_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Agora aplicar RLS sem referência a conversation_id
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

SELECT 'FIX APLICADO!' AS status;
