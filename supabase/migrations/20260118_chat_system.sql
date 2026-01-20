-- ============================================
-- SISTEMA DE CHAT E MENSAGENS
-- Criado em: 2026-01-18
-- Versão corrigida
-- ============================================

-- Remover tabelas existentes se houver conflito
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Tabela de conversas (entre 2 usuários)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    last_message_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Garantir que não haja conversas duplicadas
    CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2),
    -- Garantir que participant_1 < participant_2 para evitar duplicatas invertidas
    CONSTRAINT ordered_participants CHECK (participant_1 < participant_2)
);

-- Tabela de mensagens
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

-- Políticas para messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id
        OR EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
    );

-- ============================================
-- FUNÇÃO PARA CRIAR OU BUSCAR CONVERSA
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(user_1 UUID, user_2 UUID)
RETURNS UUID AS $$
DECLARE
    p1 UUID;
    p2 UUID;
    conv_id UUID;
BEGIN
    -- Ordenar os UUIDs para garantir consistência
    IF user_1 < user_2 THEN
        p1 := user_1;
        p2 := user_2;
    ELSE
        p1 := user_2;
        p2 := user_1;
    END IF;
    
    -- Tentar buscar conversa existente
    SELECT id INTO conv_id
    FROM public.conversations
    WHERE participant_1 = p1 AND participant_2 = p2;
    
    -- Se não existir, criar nova
    IF conv_id IS NULL THEN
        INSERT INTO public.conversations (participant_1, participant_2)
        VALUES (p1, p2)
        RETURNING id INTO conv_id;
    END IF;
    
    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO PARA ATUALIZAR ÚLTIMO MENSAGEM
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar última mensagem
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- FUNÇÃO PARA CONTAR MENSAGENS NÃO LIDAS
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_messages_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO count
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
    AND m.sender_id != p_user_id
    AND m.read_at IS NULL;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar Realtime para mensagens (ignorar erro se já estiver habilitado)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
