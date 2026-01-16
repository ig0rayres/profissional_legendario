-- =============================================
-- LIMPAR USUÁRIOS DE TESTE
-- =============================================
-- Deleta TODOS os usuários EXCETO admin e teste@teste.com

DO $$
DECLARE
    v_deleted_count integer;
    v_email_record RECORD;
BEGIN
    -- Ver quais usuários serão deletados
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  USUÁRIOS QUE SERÃO DELETADOS:';
    RAISE NOTICE '';
    
    FOR v_email_record IN 
        SELECT email FROM auth.users 
        WHERE email NOT IN ('admin@rotaclub.com', 'teste@teste.com')
        ORDER BY email
    LOOP
        RAISE NOTICE '  ❌ %', v_email_record.email;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ USUÁRIOS QUE SERÃO MANTIDOS:';
    RAISE NOTICE '  - admin@rotaclub.com';
    RAISE NOTICE '  - teste@teste.com';
    RAISE NOTICE '';
    
    -- Deletar perfis primeiro (por causa da foreign key)
    DELETE FROM public.profiles 
    WHERE email NOT IN ('admin@rotaclub.com', 'teste@teste.com');
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ Deletados % perfis', v_deleted_count;
    
    -- Deletar usuários do auth
    DELETE FROM auth.users 
    WHERE email NOT IN ('admin@rotaclub.com', 'teste@teste.com');
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ Deletados % usuários do auth', v_deleted_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 LIMPEZA COMPLETA!';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora você pode registrar:';
    RAISE NOTICE '  - recruta@rotabusiness.com';
    RAISE NOTICE '  - veterano@rotabusiness.com';
    RAISE NOTICE '  - elite@rotabusiness.com';
    
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL - Mostrar usuários restantes
-- =============================================
SELECT 
    '✅ USUÁRIOS MANTIDOS' as status,
    u.email,
    p.full_name,
    p.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.email;
