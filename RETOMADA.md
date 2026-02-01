# 🚀 RETOMADA - 2026-02-02

## 📌 COMEÇAR POR AQUI

### Arquivo Principal: `docs/sessions/SESSAO_2026-02-01.md`

---

## 🎯 PLANO DE AÇÃO (Ordem de Prioridade)

### 1️⃣ BUG CRÍTICO: Plano incorreto no Dashboard (Bug 2)
**Arquivo:** `/api/profile/me/route.ts`
**Problema:** Mostra "RECRUTA" mas deveria ser "Elite"
**Ação:** Verificar a query que busca o plano do usuário
```sql
-- Verificar no Supabase:
SELECT s.plan_id, pc.* FROM subscriptions s
LEFT JOIN plan_config pc ON s.plan_id = pc.tier
WHERE s.user_id = 'ID_DO_USUARIO'
```

### 2️⃣ BUG CRÍTICO: Dados do cadastro não salvam (Bug 3)
**Arquivo:** Trigger SQL no Supabase `handle_new_user`
**Problema:** ID Rota, Pista, dados não são salvos
**Ação:** Verificar se `user_metadata` está sendo extraído corretamente

### 3️⃣ BUG: Status PENDENTE após confirmar email (Bug 1)
**Arquivo:** `/app/admin/users/page.tsx` ou trigger SQL
**Problema:** Status não atualiza quando email é confirmado
**Ação:** Criar trigger para sincronizar `email_confirmed_at` com status

### 4️⃣ BUG: Limite de categorias errado (Bug 4)
**Arquivo:** `/app/dashboard/editar-perfil/page.tsx`
**Problema:** Mostra "0/3" mas deveria usar valor do plano
**Ação:** Buscar `max_categories` do `plan_config`

### 5️⃣ BUG: Histórico de Batalha vazio (Bug 5)
**Arquivo:** Componente que exibe histórico ou tabela `xp_history`
**Problema:** Pontos aparecem mas histórico está vazio
**Ação:** Verificar se registros estão sendo criados em `xp_history`

### 6️⃣ Reativar validação ID Rota único
**Arquivo:** Lógica de registro/perfil
**Ação:** Remover bypass de debug

---

## 📊 SEQUÊNCIA DE TRABALHO

```
1. /api/profile/me/route.ts         → Bug 2 (Plano incorreto)
2. Supabase: trigger handle_new_user → Bug 3 (Dados cadastro)
3. Trigger ou admin                  → Bug 1 (Status pendente)
4. editar-perfil/page.tsx           → Bug 4 (Categorias)
5. Componente histórico             → Bug 5 (Histórico vazio)
6. Reativar validação ID Rota
```

---

## 🛡️ REGRAS DE SEGURANÇA

⚠️ **NÃO ALTERAR sem testar localmente:**
- `/app/auth/*` - Sistema de login
- `/api/stripe/*` - Pagamentos
- RLS policies do Supabase

---

## 📁 DOCUMENTAÇÃO RELACIONADA

- `docs/sessions/SESSAO_2026-02-01.md` - Detalhes dos bugs
- `docs/components/IMAGE_CROP_COMPONENTS.md` - Crop de imagem
- `.agent/context/CONTEXTO_PROJETO.md` - Contexto geral

---

## 🔄 BACKUP DISPONÍVEL

Se precisar reverter:
```bash
git checkout v1.0.0-pre-deploy-2026-02-01
```

---

*Última atualização: 2026-02-01 15:37*
