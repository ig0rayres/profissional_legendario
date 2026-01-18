-- SISTEMA DE LEMBRETE DE CONFRARIA
-- Execute no Supabase SQL Editor

-- 1. Criar coluna para rastrear se lembrete foi enviado
ALTER TABLE confraternity_invites 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- 2. Criar função para buscar confrarias que precisam de lembrete
-- (24h antes, status=accepted, reminder_sent=false)
CREATE OR REPLACE FUNCTION get_confraternities_needing_reminder()
RETURNS TABLE (
    invite_id UUID,
    sender_id UUID,
    receiver_id UUID,
    proposed_date TIMESTAMPTZ,
    location TEXT,
    sender_email TEXT,
    sender_name TEXT,
    receiver_email TEXT,
    receiver_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id as invite_id,
        ci.sender_id,
        ci.receiver_id,
        ci.proposed_date,
        ci.location,
        s.email as sender_email,
        s.full_name as sender_name,
        r.email as receiver_email,
        r.full_name as receiver_name
    FROM confraternity_invites ci
    JOIN profiles s ON s.id = ci.sender_id
    JOIN profiles r ON r.id = ci.receiver_id
    WHERE ci.status = 'accepted'
      AND ci.reminder_sent = false
      AND ci.proposed_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para marcar lembrete como enviado
CREATE OR REPLACE FUNCTION mark_reminder_sent(invite_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE confraternity_invites 
    SET reminder_sent = true 
    WHERE id = invite_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar confrarias que precisam de lembrete agora (para teste)
SELECT * FROM get_confraternities_needing_reminder();
