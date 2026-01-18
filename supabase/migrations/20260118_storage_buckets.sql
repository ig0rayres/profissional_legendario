-- Storage buckets para avatares e capas
-- Execute no Supabase Dashboard > Storage

-- Criar bucket para avatares (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para capas (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para avatares
CREATE POLICY "Avatars são públicos para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload do próprio avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar o próprio avatar" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar o próprio avatar" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas RLS para capas
CREATE POLICY "Capas são públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Usuários podem fazer upload da própria capa" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar a própria capa" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'covers' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar a própria capa" ON storage.objects
FOR DELETE USING (
    bucket_id = 'covers' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
