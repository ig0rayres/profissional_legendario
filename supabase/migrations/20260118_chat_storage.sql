-- ==============================================
-- CRIAR BUCKET PARA ARQUIVOS DO CHAT
-- ==============================================

-- Criar bucket para arquivos do chat (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso

-- Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

-- Usuários autenticados podem ver arquivos
CREATE POLICY "Authenticated users can view chat files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-files');

-- Usuários podem deletar seus próprios arquivos
CREATE POLICY "Users can delete their chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[2]);
