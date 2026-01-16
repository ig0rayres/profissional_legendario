-- ============================================
-- LIMPAR TODAS CONTAS DE TESTE
-- ============================================

-- Deletar todos usuários de teste
DELETE FROM auth.users 
WHERE email IN (
    'recruta@rotatest.com',
    'veterano@rotatest.com', 
    'elite@rotatest.com',
    'admin@teste.com',
    'final@teste.com',
    'teste@admin.com',
    'admin123@teste.com'
);

-- Verificar que foram deletados
SELECT COUNT(*) as usuarios_restantes FROM auth.users;
