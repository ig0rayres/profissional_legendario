-- TESTE DE UPDATE NA GAMIFICAÇÃO
-- Execute no Supabase SQL Editor

-- Tentar atualizar pontos manualmente
UPDATE user_gamification 
SET total_points = total_points + 10,
    updated_at = NOW()
WHERE user_id = 'ccdc0524-6803-4017-b08c-944785e14338';

-- Verificar se funcionou
SELECT total_points, updated_at FROM user_gamification 
WHERE user_id = 'ccdc0524-6803-4017-b08c-944785e14338';
