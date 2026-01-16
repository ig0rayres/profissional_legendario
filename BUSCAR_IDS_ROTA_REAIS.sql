-- =============================================
-- BUSCAR IDS ROTA REAIS DO CADASTRO
-- =============================================

-- Ver os IDs Rota que foram digitados no formulário
SELECT 
    email,
    raw_user_meta_data->>'rota_number' as id_rota_original,
    raw_user_meta_data->>'full_name' as nome_original,
    created_at
FROM auth.users
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY email;

-- Ver o que está na tabela profiles agora
SELECT 
    email,
    rota_number as id_rota_atual,
    full_name
FROM public.profiles
WHERE email IN (
    'recruta@rotabusiness.com.br',
    'veterano@rotabusiness.com.br',
    'elite@rotabusiness.com.br'
)
ORDER BY email;
