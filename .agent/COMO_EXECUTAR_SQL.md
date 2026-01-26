# 🔧 COMO EXECUTAR SQL NO SUPABASE

## ❌ TENTATIVAS QUE NÃO FUNCIONARAM

### 1. Supabase CLI (`npx supabase db push`)
- ❌ Requer connection string do PostgreSQL
- ❌ Não funciona com SUPABASE_URL da API

### 2. API REST (`rpc/exec`)
- ❌ Função `exec` não existe por padrão no Supabase
- ❌ Precisaria criar a função primeiro

### 3. SDK do Supabase (`supabase.rpc('exec')`)
- ❌ Mesma limitação da API REST

---

## ✅ SOLUÇÃO: DASHBOARD DO SUPABASE

### **MÉTODO RECOMENDADO** (2 minutos)

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/erzprkocwzgdjrsictps/sql
   ```

2. **Abra o SQL Editor:**
   - Clique em "SQL Editor" no menu lateral
   - Ou acesse diretamente: `/sql/new`

3. **Cole o SQL:**
   - Abra: `supabase/migrations/20260125_na_rota_feed.sql`
   - Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
   - Cole no editor do Supabase

4. **Execute:**
   - Clique em "Run" (ou Ctrl+Enter)
   - Aguarde a execução (10-30 segundos)

5. **Verifique:**
   ```sql
   -- Verificar tabelas criadas
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('posts', 'post_likes', 'post_comments');
   
   -- Verificar buckets
   SELECT * FROM storage.buckets 
   WHERE id IN ('post-photos', 'post-videos');
   ```

---

## 🎯 ALTERNATIVA: COPIAR PARA CLIPBOARD

### Linux (com xclip):
```bash
cat supabase/migrations/20260125_na_rota_feed.sql | xclip -selection clipboard
```

### macOS:
```bash
cat supabase/migrations/20260125_na_rota_feed.sql | pbcopy
```

### Windows (PowerShell):
```powershell
Get-Content supabase/migrations/20260125_na_rota_feed.sql | Set-Clipboard
```

Depois é só colar no SQL Editor do Supabase!

---

## 📊 O QUE SERÁ CRIADO

### Tabelas:
- ✅ `posts` - Publicações com fotos/vídeos
- ✅ `post_likes` - Curtidas
- ✅ `post_comments` - Comentários

### Índices:
- ✅ `idx_posts_user` - Posts por usuário
- ✅ `idx_posts_created` - Posts por data
- ✅ `idx_post_likes_user` - Likes por usuário
- ✅ `idx_comments_post` - Comentários por post

### RLS Policies:
- ✅ Posts públicos visíveis para todos
- ✅ Posts privados apenas para o dono
- ✅ Posts de conexões para elos
- ✅ Likes e comentários com permissões

### Triggers:
- ✅ Atualizar contador de likes
- ✅ Atualizar contador de comentários
- ✅ Atualizar updated_at

### Storage:
- ✅ Bucket `post-photos` (10MB, jpg/png/webp/gif)
- ✅ Bucket `post-videos` (50MB, mp4/webm/mov)
- ✅ Políticas de acesso configuradas

---

## 🐛 TROUBLESHOOTING

### "relation already exists"
✅ Normal! O SQL usa `CREATE TABLE IF NOT EXISTS`

### "policy already exists"  
✅ Normal! O SQL faz `DROP POLICY IF EXISTS` antes

### "bucket already exists"
✅ Normal! O SQL usa `ON CONFLICT DO NOTHING`

### Erro de permissão
❌ Verifique se está logado como admin/owner do projeto

---

## 📝 CHECKLIST PÓS-EXECUÇÃO

Após executar o SQL, verifique:

- [ ] Tabelas criadas (3)
- [ ] Índices criados (6+)
- [ ] RLS policies ativas (12+)
- [ ] Triggers funcionando (3)
- [ ] Buckets de storage criados (2)
- [ ] Políticas de storage ativas (6)

---

## 🚀 PRÓXIMOS PASSOS

Após executar o SQL:

1. **Testar criação de post:**
   - Usar o `CreatePostModal`
   - Upload de foto
   - Verificar se aparece no feed

2. **Testar curtidas:**
   - Curtir um post
   - Verificar contador
   - Descurtir

3. **Verificar storage:**
   - Ir em Storage no dashboard
   - Ver se os buckets existem
   - Verificar políticas

---

**Tempo estimado:** 2-5 minutos
**Dificuldade:** Fácil (copiar e colar)
