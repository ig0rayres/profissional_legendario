/* Teste 1: Verificar se funções SQL existem */
SELECT 
    proname as funcao,
    'Existe ✅' as status
FROM pg_proc 
WHERE proname IN ('add_user_xp', 'award_badge', 'check_rank_up')
ORDER BY proname;
