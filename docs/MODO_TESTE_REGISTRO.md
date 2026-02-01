# 🚨 MODO TESTE - REGISTRO

## ⚠️ ALTERAÇÕES TEMPORÁRIAS PARA TESTES

### 1. ID Rota Único - DESABILITADO
**Arquivo:** `app/auth/register/page.tsx`  
**Linhas:** 162-177

A verificação de ID Rota duplicado está **COMENTADA** para permitir testes.

```tsx
// ⚠️ MODO TESTE: Verificação de duplicatas DESABILITADA temporariamente
// TODO: Reativar após testes (descomentar o código abaixo)
/*
const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('rota_number')
    .eq('rota_number', data.rotaNumber)
    .maybeSingle()

if (existingUser) {
    setError('Este ID Rota Business já está em uso. Por favor, use outro.')
    setIsLoading(false)
    return
}
*/
```

### ✅ COMO REATIVAR (PRODUÇÃO)

1. Abra `app/auth/register/page.tsx`
2. Localize o comentário `⚠️ MODO TESTE`
3. **Descomente** o bloco de código (remova `/*` e `*/`)
4. Teste localmente
5. Faça deploy

---

## CHECKLIST ANTES DE IR PARA PRODUÇÃO

- [ ] Reativar verificação de ID Rota único
- [ ] Testar registro com ID duplicado (deve bloquear)
- [ ] Verificar que erros aparecem na tela

---

**Data:** 2026-02-01  
**Motivo:** Testes de fluxo de registro
