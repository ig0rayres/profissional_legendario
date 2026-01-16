-- =============================================
-- SINCRONIZAR DADOS DO CADASTRO PARA PROFILES
-- =============================================
-- Copia os IDs Rota REAIS do cadastro para a tabela profiles

UPDATE public.profiles p
SET rota_number = u.raw_user_meta_data->>'rota_number'
FROM auth.users u
WHERE p.id = u.id
AND u.email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
AND u.raw_user_meta_data->>'rota_number' IS NOT NULL;

-- Verificar resultado
SELECT 
    email,
    rota_number,
    full_name,
    role
FROM public.profiles
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY email;
