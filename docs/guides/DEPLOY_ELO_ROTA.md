# 🚀 DEPLOY RÁPIDO - ELO DA ROTA

## ⚡ 3 Passos para Deploy

### 1️⃣ **SQL no Supabase** (2 min)
```bash
1. Abra: https://app.supabase.com
2. SQL Editor → New query
3. Cole: deploy_elo_da_rota.sql
4. Execute (Run)
```

### 2️⃣ **Verificar** (30 seg)
```sql
-- Copie e execute este SQL para verificar:
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name LIKE 'confrat%') as tabelas,
    (SELECT COUNT(*) FROM badges 
     WHERE id LIKE '%confraria%') as badges,
    (SELECT COUNT(*) FROM pg_proc 
     WHERE proname LIKE '%confrat%') as funcoes;

-- Deve retornar:
-- tabelas: 3
-- badges: 3  
-- funcoes: 3
```

### 3️⃣ **Testar** (1 min)
```bash
# Acessar:
http://localhost:3000/elo-da-rota

# Verificar:
✅ Dashboard carrega
✅ Indicador de limites aparece
✅ Botões funcionam
```

---

## ✅ PRONTO!

Sistema está operacional. Para detalhes completos:
📖 Ver: `docs/ELO_DA_ROTA_IMPLEMENTATION.md`

