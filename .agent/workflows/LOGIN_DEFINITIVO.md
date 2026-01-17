---
description: Sistema definitivo para prevenir quebra do login
---

# 🛡️ SISTEMA DE PROTEÇÃO DEFINITIVO DO LOGIN

## 🎯 PROBLEMA IDENTIFICADO:

**Data:** 2026-01-17
**Sintoma:** Login trava em "Entrando..." após adicionar busca de perfil no `useEffect`

### Comparação de Versões:

#### ✅ Commit `7bead282` - LOGIN FUNCIONANDO
```typescript
// VERSÃO SIMPLES - SEM busca de perfil no useEffect inicial
useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.email!.split('@')[0],
            is_professional: false,
            role: 'user'
        } : null)
        setLoading(false)
    })
}, [])
```

#### ❌ Commits `428ba8ac` e `b2a7dfe5` - LOGIN TRAVADO
```typescript
// VERSÃO COM PROFILE FETCH - CAUSA RACE CONDITION
useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
            try {
                // ⚠️ ESTE FETCH PODE TRAVAR SE RLS ESTIVER BLOQUEANDO
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle()
                // ... resto do código
            } catch (error) {
                // ...
            }
        }
        setLoading(false)
    })
}, [])
```

## 🔧 SOLUÇÃO DEFINITIVA:

### Arquitetura em 3 Camadas:

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 1: Auth Básico (NUNCA FALHA)                    │
│  - Usa apenas session.user do Supabase Auth             │
│  - Define setLoading(false) SEMPRE                       │
│  - Login funciona MESMO se BD estiver offline            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CAMADA 2: Profile Enriquecimento (OPCIONAL)            │
│  - Busca perfil do banco DEPOIS do login                │
│  - Usa timeout de 3s para evitar travamento             │
│  - Se falhar, continua com dados básicos                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CAMADA 3: Backup Automático (RECOVERY)                 │
│  - Git tag automático antes de mexer em auth            │
│  - Script de rollback com 1 comando                     │
│  - Logs detalhados de cada mudança                      │
└─────────────────────────────────────────────────────────┘
```

## 📝 IMPLEMENTAÇÃO:

### 1. Criar backup ANTES de mexer em auth:

```bash
# turbo-all
git tag "auth-backup-$(date +%Y%m%d-%H%M%S)"
git add -A
git commit -m "🔖 CHECKPOINT: Antes de modificar auth"
```

### 2. Aplicar versão híbrida do auth-context.tsx:

```typescript
// ✅ VERSÃO HÍBRIDA - O MELHOR DE AMBOS
useEffect(() => {
    // FASE 1: Auth Rápido (NUNCA FALHA)
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            // Define usuário básico IMEDIATAMENTE
            const basicUser = {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.email!.split('@')[0],
                is_professional: false,
                role: 'user' as const
            }
            setUser(basicUser)
            setLoading(false) // ✅ JÁ LIBERA A UI
            
            // FASE 2: Enriquecimento (NÃO-BLOQUEANTE)
            Promise.race([
                supabase.from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('timeout')), 3000)
                )
            ])
            .then((result: any) => {
                if (result?.data) {
                    setUser({
                        ...basicUser,
                        full_name: result.data.full_name || basicUser.full_name,
                        role: result.data.role || 'user',
                        is_professional: result.data.role === 'professional',
                        pista: result.data.pista
                    })
                }
            })
            .catch(err => {
                console.warn('Profile enrichment failed (non-critical):', err)
                // Continua com basicUser
            })
        } else {
            setLoading(false)
        }
    })
}, [])
```

### 3. Script de Rollback Instantâneo:

```bash
#!/bin/bash
# Arquivo: scripts/rollback-auth.sh

echo "🔙 Voltando para última versão funcional do login..."

# Encontrar último backup
LAST_BACKUP=$(git tag -l "auth-backup-*" | sort -r | head -n1)

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ Nenhum backup encontrado!"
    echo "📍 Usando commit fixo: 7bead282"
    git checkout 7bead282 -- lib/auth/context.tsx app/auth/login/page.tsx
else
    echo "✅ Encontrado backup: $LAST_BACKUP"
    git checkout $LAST_BACKUP -- lib/auth/context.tsx app/auth/login/page.tsx
fi

echo "✅ Login restaurado! Reinicie o servidor."
```

## 🚨 REGRAS DE OURO (NUNCA VIOLAR):

1. **✅ SEMPRE** usar `.maybeSingle()`, NUNCA `.single()`
2. **✅ SEMPRE** definir `setLoading(false)` em TODOS os caminhos
3. **✅ SEMPRE** criar git tag antes de mexer em auth
4. **✅ SEMPRE** usar timeout em queries de perfil
5. **✅ NUNCA** bloquear login com await de queries de BD
6. **✅ NUNCA** assumir que profile existe no banco

## 🧪 TESTES OBRIGATÓRIOS:

Antes de commitar mudanças em auth:

```bash
# 1. Login com usuário existente
# 2. Login com usuário sem perfil no BD
# 3. Login com BD offline (simular timeout)
# 4. Login com RLS bloqueando
# 5. Logout e login novamente
```

## 📊 CHECKLIST DE SEGURANÇA:

Antes de mexer em auth, responder SIM para TODAS:

- [ ] Criei git tag de backup?
- [ ] Testei com BD offline?
- [ ] `setLoading(false)` está em TODOS os caminhos?
- [ ] Usei `.maybeSingle()` em vez de `.single()`?
- [ ] Profile fetch tem timeout de 3s?
- [ ] Login funciona SEM perfil no banco?

## 🎯 COMMITS IMPORTANTES:

- **`7bead282`**: Login simples e funcional (GOLDEN VERSION)
- **`f8102889`**: Workflow de proteção criado
- **`428ba8ac` e `b2a7dfe5`**: Versões com bug (EVITAR)

---

**Última atualização:** 2026-01-17  
**Status:** ATIVO - Usar este workflow SEMPRE
