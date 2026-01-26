# 🚀 DEPLOY DO MÓDULO "NA ROTA"

## 📋 PASSO A PASSO

### 1️⃣ **EXECUTAR SQL NO SUPABASE**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo: `supabase/migrations/20260125_na_rota_feed.sql`
4. Cole no editor e clique em **Run**

**OU** use a CLI do Supabase:
```bash
npx supabase db push
```

---

### 2️⃣ **VERIFICAR SE FOI CRIADO**

Execute este SQL para verificar:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'post_likes', 'post_comments');

-- Verificar buckets
SELECT * FROM storage.buckets 
WHERE id IN ('post-photos', 'post-videos');
```

Deve retornar:
- ✅ 3 tabelas (posts, post_likes, post_comments)
- ✅ 2 buckets (post-photos, post-videos)

---

### 3️⃣ **PRÓXIMOS PASSOS**

Após executar o SQL, vou criar:
1. ✅ Componente `PostCard` - Card de post com curtir/comentar
2. ✅ Componente `CreatePostModal` - Modal para criar posts
3. ✅ Atualizar `NaRotaFeed` - Para carregar posts reais
4. ✅ Página `/na-rota` - Feed global

---

## 🔧 TROUBLESHOOTING

### Erro: "relation already exists"
- Normal se já executou antes
- As políticas DROP IF EXISTS vão recriar

### Erro: "bucket already exists"
- Normal se já executou antes
- O ON CONFLICT DO NOTHING vai ignorar

### Erro: "permission denied"
- Verifique se está logado como admin no Supabase

---

## ✅ CHECKLIST

- [ ] SQL executado no Supabase
- [ ] Tabelas criadas (posts, post_likes, post_comments)
- [ ] Buckets criados (post-photos, post-videos)
- [ ] RLS policies ativas
- [ ] Triggers funcionando

---

**Depois de executar o SQL, me avise para eu continuar com os componentes!** 🚀
