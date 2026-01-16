-- ============================================
-- TESTE RÁPIDO - ELO DA ROTA
-- Validar se sistema foi instalado corretamente
-- ============================================

-- TESTE 1: Verificar Tabelas criadas
SELECT 
    'Tabelas' as tipo,
    COUNT(*) as total,
    '5 esperadas' as esperado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'confraternity_invites',
    'confraternities', 
    'confraternity_limits',
    'connections',
    'messages'
);

-- TESTE 2: Verificar Badges adicionadas
SELECT 
    'Badges' as tipo,
    COUNT(*) as total,
    '3 esperadas' as esperado
FROM badges 
WHERE id IN (
    'primeira_confraria',
    'networker_ativo', 
    'mestre_conexoes'
);

-- TESTE 3: Verificar Funções SQL
SELECT 
    'Funções' as tipo,
    COUNT(*) as total,
    '3 esperadas' as esperado
FROM pg_proc 
WHERE proname IN (
    'check_confraternity_limit',
    'increment_confraternity_count',
    'are_connected'
);

-- TESTE 4: Detalhes das Tabelas
SELECT 
    table_name as tabela,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'confrat%'
ORDER BY table_name;

-- TESTE 5: Ver Novas Badges
SELECT 
    id,
    name as nome,
    xp_reward as xp,
    is_active as ativa
FROM badges
WHERE id IN (
    'primeira_confraria',
    'networker_ativo',
    'mestre_conexoes'
);

-- ============================================
-- RESULTADO ESPERADO:
-- Teste 1: total = 5
-- Teste 2: total = 3
-- Teste 3: total = 3
-- Teste 4: 3 tabelas com colunas
-- Teste 5: 3 badges ativas
-- ============================================
