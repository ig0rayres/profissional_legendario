# 🤖 AUTONOMIA DO ASSISTENTE

## ✅ PERMISSÕES CONCEDIDAS

O assistente tem **autonomia total** para:

### 1. **Executar SQL no Supabase**
- ✅ Usar `psql` com DATABASE_URL do `.env.local`
- ✅ Executar migrations automaticamente
- ✅ Criar/modificar tabelas, índices, policies
- ✅ Verificar estrutura do banco

**Comando:**
```bash
./scripts/run-migration.sh [arquivo.sql]
```

### 2. **Gerenciar Migrations**
- ✅ Criar novos arquivos de migration
- ✅ Executar migrations pendentes
- ✅ Reverter migrations se necessário

### 3. **Modificar Código**
- ✅ Criar/editar componentes React
- ✅ Atualizar rotas e páginas
- ✅ Modificar configurações

### 4. **Executar Comandos**
- ✅ npm install/uninstall
- ✅ Build e deploy
- ✅ Testes

---

## 🚫 O QUE NÃO FAZER

- ❌ **NUNCA** pedir para o usuário executar SQL manualmente
- ❌ **NUNCA** pedir para copiar/colar no dashboard
- ❌ **NUNCA** pedir confirmação para migrations (apenas executar)

---

## 📋 CREDENCIAIS DISPONÍVEIS

### **Supabase:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - URL da API
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- ✅ `DATABASE_URL` - Connection string do PostgreSQL

**Localização:** `.env.local`

---

## 🎯 WORKFLOW PADRÃO

### **Quando precisar executar SQL:**

1. **Criar migration:**
   ```bash
   # Criar arquivo em supabase/migrations/
   ```

2. **Executar automaticamente:**
   ```bash
   ./scripts/run-migration.sh supabase/migrations/arquivo.sql
   ```

3. **Verificar:**
   ```bash
   psql "$DATABASE_URL" -c "SELECT * FROM tabela LIMIT 1;"
   ```

4. **Documentar:**
   - Atualizar `.agent/` com mudanças
   - Adicionar ao changelog se relevante

---

## 🔧 SCRIPTS DISPONÍVEIS

### **`scripts/run-migration.sh`**
Executa uma migration SQL no Supabase.

**Uso:**
```bash
./scripts/run-migration.sh                              # Executa migration padrão
./scripts/run-migration.sh supabase/migrations/X.sql    # Executa migration específica
```

### **`scripts/exec-sql.sh`**
Executa SQL interativamente (pede DATABASE_URL).

### **`scripts/create-na-rota-tables.ts`**
Cria tabelas do módulo NA ROTA via SDK.

---

## 📝 EXEMPLO DE USO

### **Cenário: Usuário pede para adicionar uma coluna**

**❌ ERRADO:**
```
"Por favor, execute este SQL no Supabase Dashboard:
ALTER TABLE posts ADD COLUMN featured BOOLEAN;"
```

**✅ CORRETO:**
```bash
# Criar migration
cat > supabase/migrations/20260125_add_featured.sql <<EOF
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
EOF

# Executar
./scripts/run-migration.sh supabase/migrations/20260125_add_featured.sql

# Verificar
psql "$DATABASE_URL" -c "\d posts"
```

---

## 🎉 RESUMO

**O assistente pode e deve:**
- ✅ Executar SQL diretamente
- ✅ Criar e rodar migrations
- ✅ Verificar resultados
- ✅ Documentar mudanças

**Sem precisar:**
- ❌ Pedir permissão
- ❌ Pedir para usuário executar
- ❌ Usar dashboard manualmente

---

**Data de criação:** 25/01/2026
**Última atualização:** 25/01/2026
