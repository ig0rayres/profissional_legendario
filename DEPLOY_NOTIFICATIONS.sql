-- SISTEMA DE NOTIFICAÇÕES REAIS
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. TABELA DE NOTIFICAÇÕES
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'connection_request', 'connection_accepted', 'message', 'rating', 'project', 'system'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- 'normal', 'high', 'critical'
    action_url TEXT, -- URL para redirecionar quando clicar
    metadata JSONB DEFAULT '{}', -- Dados extras (ex: from_user_id)
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. RLS PARA NOTIFICAÇÕES
-- ========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ========================================
-- 3. TRIGGER PARA CRIAR NOTIFICAÇÃO QUANDO CONEXÃO É SOLICITADA
-- ========================================
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
    requester_name TEXT;
BEGIN
    -- Buscar nome do solicitante
    SELECT full_name INTO requester_name 
    FROM profiles WHERE id = NEW.requester_id;

    -- Criar notificação para o destinatário
    INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
    VALUES (
        NEW.addressee_id,
        'connection_request',
        'Nova Solicitação de Elo',
        requester_name || ' deseja criar um Elo com você!',
        '/professional/' || NEW.requester_id,
        jsonb_build_object('from_user_id', NEW.requester_id, 'connection_id', NEW.id)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_connection_request ON user_connections;
CREATE TRIGGER on_connection_request
    AFTER INSERT ON user_connections
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION notify_connection_request();

-- ========================================
-- 4. TRIGGER PARA CRIAR NOTIFICAÇÃO QUANDO CONEXÃO É ACEITA
-- ========================================
CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
    accepter_name TEXT;
BEGIN
    -- Só notifica se mudou para accepted
    IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
        -- Buscar nome de quem aceitou
        SELECT full_name INTO accepter_name 
        FROM profiles WHERE id = NEW.addressee_id;

        -- Criar notificação para o solicitante original
        INSERT INTO notifications (user_id, type, title, body, priority, action_url, metadata)
        VALUES (
            NEW.requester_id,
            'connection_accepted',
            '🔗 Elo Ligado!',
            accepter_name || ' aceitou seu convite de Elo!',
            'high',
            '/professional/' || NEW.addressee_id,
            jsonb_build_object('from_user_id', NEW.addressee_id, 'connection_id', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_connection_accepted ON user_connections;
CREATE TRIGGER on_connection_accepted
    AFTER UPDATE ON user_connections
    FOR EACH ROW
    EXECUTE FUNCTION notify_connection_accepted();

-- ========================================
-- 5. CRIAR NOTIFICAÇÕES DE BOAS-VINDAS PARA USUÁRIOS EXISTENTES
-- ========================================
INSERT INTO notifications (user_id, type, title, body, priority)
SELECT 
    id,
    'system',
    'Bem-vindo ao Rota Business Club!',
    'Suas ações no Club geram Vigor e aumentam sua patente. Explore e conquiste!',
    'normal'
FROM profiles
WHERE id NOT IN (
    SELECT user_id FROM notifications WHERE type = 'system' AND title LIKE 'Bem-vindo%'
);

-- ========================================
-- VERIFICAR
-- ========================================
SELECT 'Tabela notifications criada!' as status;
SELECT COUNT(*) as total_notifications FROM notifications;
