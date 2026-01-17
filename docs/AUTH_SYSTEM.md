# 🔐 Sistema de Autenticação - Guia Completo

**Status:** ✅ SEGURO E ESTÁVEL  
**Última Atualização:** 2026-01-17  
**Commit Atual:** `e01f142d`

---

## 📋 Visão Geral

O sistema de autenticação foi redesenhado com **arquitetura híbrida de 2 fases** para garantir:
- ✅ Login **NUNCA trava**
- ✅ Funciona **mesmo com banco offline**
- ✅ Recuperação **automática** de erros
- ✅ Rollback **em 1 comando**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  FASE 1: Auth Rápido (NUNCA FALHA)                      │
│  • Usa apenas session.user do Supabase Auth             │
│  • setLoading(false) IMEDIATAMENTE                       │
│  • UI liberada em <100ms                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FASE 2: Enriquecimento (NÃO-BLOQUEANTE)                │
│  • Busca perfil do banco (timeout 3s)                   │
│  • Se falhar: continua com dados básicos                │
│  • Se sucesso: atualiza user com dados completos        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Comandos Rápidos

### Verificar se auth está seguro:
```bash
./scripts/verify-auth.sh
```

### Fazer rollback em caso de problema:
```bash
./scripts/rollback-auth.sh
```

### Criar backup antes de modificar:
```bash
git tag "auth-backup-$(date +%Y%m%d-%H%M%S)"
git add -A
git commit -m "🔖 CHECKPOINT: Antes de modificar auth"
```

---

## 📝 Regras de Ouro (NUNCA VIOLAR)

1. **✅ SEMPRE** usar `.maybeSingle()`, NUNCA `.single()`
2. **✅ SEMPRE** definir `setLoading(false)` em TODOS os caminhos
3. **✅ SEMPRE** criar git tag antes de mexer em auth
4. **✅ SEMPRE** usar timeout em queries de perfil (3s)
5. **✅ NUNCA** bloquear login com await de queries de BD
6. **✅ NUNCA** assumir que profile existe no banco

---

## 🧪 Checklist de Testes

Antes de commitar mudanças em auth, testar:

- [ ] Login com usuário existente
- [ ] Login com usuário sem perfil no BD
- [ ] Login com BD offline (simular timeout)
- [ ] Login com RLS bloqueando
- [ ] Logout e login novamente
- [ ] Abrir console do navegador (não deve ter erros)

---

## 🔍 Troubleshooting

### Login trava em "Entrando..."

```bash
# 1. Verificar se auth está seguro
./scripts/verify-auth.sh

# 2. Se houver erros, fazer rollback
./scripts/rollback-auth.sh

# 3. Reiniciar servidor
npm run dev
```

### Perfil não carrega

Isso é **esperado** e **não é crítico**. O sistema funciona em 2 fases:
1. Login básico funciona SEMPRE
2. Perfil enriquece dados **depois** (pode falhar sem problemas)

Verificar no console:
```
[Auth] Profile enrichment failed (non-critical): timeout
```
Isso significa que o banco demorou >3s, mas o login **já funcionou**.

### RLS bloqueando profiles

Execute no Supabase SQL Editor:

```sql
-- Ver políticas atuais
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Garantir leitura para autenticados
DROP POLICY IF EXISTS "Profiles são visíveis para todos autenticados" ON public.profiles;
CREATE POLICY "Profiles são visíveis para todos autenticados"
ON public.profiles FOR SELECT USING (true);
```

---

## 📚 Workflows Relacionados

- `/LOGIN_DEFINITIVO` - Documentação completa do sistema
- `/PROTECAO_LOGIN` - Proteções implementadas
- `scripts/verify-auth.sh` - Verificação automática
- `scripts/rollback-auth.sh` - Rollback rápido

---

## 🎯 Commits Importantes

| Commit | Descrição | Status |
|--------|-----------|--------|
| `e01f142d` | Solução definitiva com arquitetura híbrida | ✅ ATUAL |
| `7bead282` | Login simples funcional (fallback) | ✅ GOLDEN |
| `f8102889` | Workflow de proteção criado | ✅ OK |
| `428ba8ac`, `b2a7dfe5` | Versões com bug | ❌ EVITAR |

---

## 🛡️ Sistema de Backup

### Tags Automáticas

Toda vez que você vai mexer em auth, crie uma tag:
```bash
git tag "auth-backup-$(date +%Y%m%d-%H%M%S)"
```

### Ver Backups Disponíveis

```bash
git tag -l "auth-backup-*"
```

### Restaurar de um Backup Específico

```bash
git checkout auth-backup-20260117-082604 -- lib/auth/context.tsx
```

---

## 💡 Exemplo de Código Seguro

```typescript
// ✅ APROVADO - Auth rápido + enriquecimento assíncrono
useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            const basicUser = {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.email!.split('@')[0],
                is_professional: false,
                role: 'user' as const
            }
            
            setUser(basicUser)
            setLoading(false) // ✅ UI já liberada
            
            // Enriquecimento NÃO-BLOQUEANTE
            Promise.race([
                supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ])
            .then((result: any) => {
                if (result?.data) setUser({ ...basicUser, ...result.data })
            })
            .catch(err => console.warn('Profile enrichment failed:', err))
        } else {
            setLoading(false)
        }
    })
}, [])
```

---

## ⚠️ Anti-Padrões (NUNCA FAZER)

```typescript
// ❌ NUNCA - Usar .single()
const { data } = await supabase.from('profiles').select('*').single()

// ❌ NUNCA - Async bloqueante no .then()
supabase.auth.getSession().then(async ({ data: { session } }) => {
    const profile = await supabase.from('profiles').select('*') // BLOQUEIA!
})

// ❌ NUNCA - Não definir setLoading(false)
if (session?.user) {
    setUser(session.user)
    // Faltou setLoading(false) ❌
}

// ❌ NUNCA - Query sem timeout
const profile = await supabase.from('profiles').select('*') // Pode travar!
```

---

## 📞 Suporte

Se encontrar problemas:

1. Execute `./scripts/verify-auth.sh`
2. Se houver erros, execute `./scripts/rollback-auth.sh`
3. Verifique o workflow `/LOGIN_DEFINITIVO`
4. Em último caso, volte para commit `7bead282`

---

**Desenvolvido com 🔥 para nunca mais perder 10 horas com login!**
