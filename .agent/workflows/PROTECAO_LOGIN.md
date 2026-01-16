---
description: Proteções contra problemas de login futuras
---

# 🛡️ PROTEÇÕES CONTRA QUEBRA DO LOGIN

## ❌ O QUE CAUSOU O PROBLEMA HOJE:

1. **Uso de `.single()`** - Retornava erro 406 quando perfil não existia
2. **Falta de error handling** - Promises sem try/catch travavam o app
3. **Busca de perfil bloqueante** - Se falhasse, o login ficava "Entrando..." para sempre
4. **Lógica complexa** - Múltiplos níveis de fallback criavam race conditions

## ✅ PROTEÇÕES IMPLEMENTADAS:

### 1. **Auth Context Simplificado**
- ❌ NUNCA usar `.single()` - sempre `.maybeSingle()`
- ✅ Login funciona MESMO se o perfil não existir
- ✅ Sempre chama `setLoading(false)` - NUNCA trava

### 2. **Regras de Ouro**
```typescript
// ❌ NUNCA FAÇA ISSO:
const { data } = await supabase.from('profiles').select('*').single()

// ✅ SEMPRE FAÇA ISSO:
const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
if (error) console.error(error)
if (!data) {
  // Continuar mesmo sem perfil
}
```

### 3. **Princípios Invioláveis**
- 🔒 **Login NUNCA depende de perfil** - Auth primeiro, perfil depois
- 🔒 **Sempre try/catch em async** - Nenhuma promise sem tratamento
- 🔒 **Loading state sempre resolve** - Nunca deixar em loading infinito
- 🔒 **window.location.href para redirect** - Mais confiável que router.push()

## 🔍 COMO VERIFICAR SE ESTÁ SEGURO:

### Checklist antes de modificar auth:
- [ ] Tem try/catch em TODAS as promises?
- [ ] Usa `.maybeSingle()` em vez de `.single()`?
- [ ] `setLoading(false)` é chamado em TODOS os caminhos (sucesso E erro)?
- [ ] Login funciona mesmo se banco estiver vazio?
- [ ] Testou com usuário SEM perfil?

## 🚨 SE O LOGIN QUEBRAR NO FUTURO:

```bash
# 1. Voltar para este commit que funciona:
git reset --hard 7bead28

# 2. Reiniciar servidor:
npm run dev

# 3. Testar login
```

## 📝 EXEMPLO DE CÓDIGO SEGURO:

```typescript
// ✅ PADRÃO APROVADO para buscar dados do usuário
useEffect(() => {
  supabase.auth.getSession()
    .then(({ data: { session } }) => {
      if (session?.user) {
        // Tentar buscar perfil MAS não bloquear se falhar
        supabase.from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error('Profile error:', error)
            setUser(data || createBasicUser(session.user))
          })
          .catch(err => {
            console.error('Unexpected error:', err)
            setUser(createBasicUser(session.user))
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
    .catch(() => setLoading(false))
}, [])
```

## 🎯 GARANTIAS:

1. ✅ **Login sempre funciona** - Mesmo com BD vazio
2. ✅ **Nunca trava** - Todos os caminhos resolvem loading
3. ✅ **Recuperável** - Git commit de backup
4. ✅ **Testável** - Pode testar sem configuração complexa

---

**Última atualização:** 2026-01-16
**Commit seguro:** `7bead28`
