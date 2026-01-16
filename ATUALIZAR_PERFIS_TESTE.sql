-- ============================================
-- ATUALIZAR PERFIS DAS 3 CONTAS OFICIAIS
-- Execute APÓS criar as 3 contas no Dashboard
-- ============================================

-- Atualizar perfil RECRUTA
UPDATE profiles 
SET 
    full_name = 'Recruta Oficial',
    cpf = '123.456.789-09'
WHERE email = 'recruta.teste@rotabusiness.com';

-- Atualizar perfil VETERANO
UPDATE profiles 
SET 
    full_name = 'Veterano Oficial',
    cpf = '987.654.321-00'
WHERE email = 'veterano.teste@rotabusiness.com';

-- Atualizar perfil ELITE
UPDATE profiles 
SET 
    full_name = 'Elite Oficial',
    cpf = '111.444.777-35'
WHERE email = 'elite.teste@rotabusiness.com';

-- Verificar os 3 perfis
SELECT 
    email,
    full_name,
    cpf
FROM profiles
WHERE email IN (
    'recruta.teste@rotabusiness.com',
    'veterano.teste@rotabusiness.com',
    'elite.teste@rotabusiness.com'
)
ORDER BY email;
