-- ===============================================
-- LIMPAR USUÁRIOS DE TESTE
-- ===============================================
-- ATENÇÃO: Este script deleta Elite, Veterano e Recruta
-- Execute APENAS se tiver certeza!

-- Ver quais usuários serão deletados
SELECT 
    id,
    email,
    full_name,
    'SERÁ DELETADO' as status
FROM profiles
WHERE email LIKE '%rotabusiness%'
AND full_name NOT ILIKE '%administrador%';

-- DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR A EXCLUSÃO:

/*
-- Deletar usuários (CASCADE vai deletar tudo relacionado)
DELETE FROM profiles
WHERE email LIKE '%rotabusiness%'
AND full_name NOT ILIKE '%administrador%';

-- Verificar se foi deletado
SELECT 
    COUNT(*) as usuarios_restantes,
    '✅ Usuários de teste deletados' as status
FROM profiles
WHERE email LIKE '%rotabusiness%';
*/
