-- VERIFICAR ESTRUTURA DA TABELA NOTIFICATIONS
-- Execute no Supabase SQL Editor

-- Ver colunas da tabela notifications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Tentar inserir uma notificação manualmente
INSERT INTO notifications (user_id, type, title, body, read_at, metadata)
VALUES (
    'efed140e-14e1-456c-b6df-643c974106a3', -- ID do Recruta
    'confraternity_invite',
    'Teste de Confraria',
    'Esta é uma notificação de teste',
    NULL,
    '{}'::jsonb
);

-- Verificar se foi inserida
SELECT * FROM notifications 
WHERE type = 'confraternity_invite'
ORDER BY created_at DESC
LIMIT 5;
