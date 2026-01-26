# 🔧 EXECUTAR SQL NO SUPABASE VIA PSQL

## ✅ MÉTODO DEFINITIVO

### **Pré-requisitos:**
```bash
# Instalar psql (se não tiver)
sudo apt install postgresql-client
```

---

## 🚀 EXECUÇÃO AUTOMÁTICA

### **Opção 1: Script Interativo**
```bash
./scripts/exec-sql.sh
```
O script vai pedir a DATABASE_URL e executar automaticamente.

### **Opção 2: Comando Direto**
```bash
psql "postgresql://postgres:SENHA@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres" \
  -f supabase/migrations/ARQUIVO.sql
```

---

## 📋 CREDENCIAIS DO SUPABASE

### **Connection String:**
```
postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres
```

### **Componentes:**
- **Host:** `db.erzprkocwzgdjrsictps.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `SPZxyF4G0oRZv49.`

---

## 📝 EXEMPLOS DE USO

### **Executar uma migration:**
```bash
psql "postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres" \
  -f supabase/migrations/20260125_na_rota_feed.sql
```

### **Executar comando SQL direto:**
```bash
psql "postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres" \
  -c "SELECT * FROM posts LIMIT 5;"
```

### **Executar múltiplos comandos:**
```bash
psql "postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres" <<EOF
CREATE TABLE test (id INT);
INSERT INTO test VALUES (1);
SELECT * FROM test;
EOF
```

---

## 🛠️ HELPER SCRIPT

Criei um script helper em `scripts/exec-sql.sh`:

```bash
#!/bin/bash
# Uso: ./scripts/exec-sql.sh [arquivo.sql]

SQL_FILE="${1:-supabase/migrations/20260125_na_rota_feed.sql}"
DATABASE_URL="postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres"

echo "🚀 Executando: $SQL_FILE"
psql "$DATABASE_URL" -f "$SQL_FILE"
```

**Uso:**
```bash
chmod +x scripts/exec-sql.sh
./scripts/exec-sql.sh                                    # Executa migration padrão
./scripts/exec-sql.sh supabase/migrations/outro.sql      # Executa arquivo específico
```

---

## 🔒 SEGURANÇA

### **IMPORTANTE:**
- ⚠️ **NUNCA** commite a senha no Git
- ⚠️ A senha está em `.env.local` (que está no `.gitignore`)
- ⚠️ Use variáveis de ambiente em produção

### **Usar variável de ambiente:**
```bash
# Adicionar ao .env.local
DATABASE_URL="postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres"

# Usar no script
source .env.local
psql "$DATABASE_URL" -f migration.sql
```

---

## 📊 VERIFICAR EXECUÇÃO

### **Listar tabelas criadas:**
```bash
psql "$DATABASE_URL" -c "\dt"
```

### **Verificar tabela específica:**
```bash
psql "$DATABASE_URL" -c "\d posts"
```

### **Contar registros:**
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM posts;"
```

### **Ver buckets de storage:**
```bash
psql "$DATABASE_URL" -c "SELECT * FROM storage.buckets;"
```

---

## 🐛 TROUBLESHOOTING

### **Erro: "psql: command not found"**
```bash
sudo apt install postgresql-client
```

### **Erro: "connection refused"**
- Verifique se o host está correto
- Verifique se a porta 5432 está aberta

### **Erro: "password authentication failed"**
- Verifique se a senha está correta
- Senha atual: `SPZxyF4G0oRZv49.`

### **Erro: "relation already exists"**
✅ Normal! Use `CREATE TABLE IF NOT EXISTS`

---

## 📦 MIGRATIONS DISPONÍVEIS

### **Módulo NA ROTA:**
```bash
psql "$DATABASE_URL" -f supabase/migrations/20260125_na_rota_feed.sql
```

**Cria:**
- Tabelas: `posts`, `post_likes`, `post_comments`
- RLS Policies
- Triggers
- Storage buckets

---

## ✅ CHECKLIST

Após executar uma migration:

- [ ] Verificar tabelas criadas: `\dt`
- [ ] Verificar índices: `\di`
- [ ] Verificar policies: `SELECT * FROM pg_policies;`
- [ ] Verificar triggers: `\dy`
- [ ] Verificar storage: `SELECT * FROM storage.buckets;`

---

## 🎯 RESUMO

**Para executar qualquer SQL no Supabase:**

1. **Tenha psql instalado**
2. **Use a connection string**
3. **Execute:** `psql "$DATABASE_URL" -f arquivo.sql`

**Pronto!** Nunca mais precisa do dashboard! 🚀
