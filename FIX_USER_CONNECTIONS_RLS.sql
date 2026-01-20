-- ============================================
-- LIMPAR E RECRIAR RLS DE USER_CONNECTIONS
-- ============================================

-- Dropar TODAS as políticas existentes
DROP POLICY IF EXISTS "Anyone can view accepted connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can delete their connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update received connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update their connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can view their connections" ON public.user_connections;

-- Garantir que RLS está ativo
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- NOVA POLÍTICA: SELECT - usuários podem ver suas próprias conexões
CREATE POLICY "select_own_connections" ON public.user_connections
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- NOVA POLÍTICA: INSERT - usuário logado pode criar solicitação
CREATE POLICY "insert_connection_request" ON public.user_connections
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id
    );

-- NOVA POLÍTICA: UPDATE - participantes podem atualizar (aceitar/rejeitar)
CREATE POLICY "update_connection" ON public.user_connections
    FOR UPDATE USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- NOVA POLÍTICA: DELETE - participantes podem deletar
CREATE POLICY "delete_connection" ON public.user_connections
    FOR DELETE USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- Verificar resultado
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_connections';
