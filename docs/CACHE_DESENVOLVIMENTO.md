# ⚠️ IMPORTANTE: Cache em Desenvolvimento

## Problema
Durante o desenvolvimento com `npm run dev`, o Next.js pode fazer cache de:
- Componentes React
- Queries do Supabase
- Estados de hooks

## Sintomas
- Alterações no banco não aparecem imediatamente
- Valores antigos permanecem mesmo depois de salvar

## Soluções

### 1. Hard Refresh (Mais Rápido)
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Limpar Cache do Navegador
1. Abrir DevTools (F12)
2. Clicar com botão direito no ícone de reload
3. Escolher "Limpar cache e atualizar"

### 3. Usar função reload() do hook
```typescript
const { sizes, loading, reload } = useAvatarConfig('elo', 'desktop')

// Chamar reload() para forçar atualização
reload()
```

### 4. Reiniciar servidor dev (Último Recurso)
```bash
# Parar: Ctrl + C
# Iniciar novamente:
npm run dev
```

## Prevenção

### Em Produção
- ✅ Não há problema! O cache é gerenciado corretamente
- ✅ Supabase Realtime pode ser usado para updates em tempo real

### Em Desenvolvimento
- ⚠️ Sempre fazer hard refresh após mudanças no banco
- ⚠️ Se usar o editor `/avatar-editor`, recarregar a página depois de salvar
- ⚠️ Configurações já incluem `order by updated_at` para cache-busting

## Implementações Anti-Cache

### 1. Hook useAvatarConfig
- ✅ Usa `refreshKey` para forçar recarga
- ✅ Função `reload()` disponível
- ✅ Query ordenada por `updated_at`

### 2. Função getSpecificAvatarConfig
- ✅ Usa `.order('updated_at', { ascending: false })`
- ✅ Usa `.limit(1)` + `.maybeSingle()` ao invés de `.single()`
- ✅ Sempre busca o registro mais recente

## Quando Ocorre Cache?

### ❌ Cache Problemático (DEV)
- Hot Module Replacement (HMR) do Next.js
- React Fast Refresh
- Supabase client-side cache

### ✅ Cache Normal (PROD)
- CDN cache (bom!)
- Browser cache (bom!)
- API route cache (gerenciável)

---

**Resumo:** Em **desenvolvimento**, sempre faça **Ctrl+Shift+R** após salvar configurações. Em **produção**, tudo funciona normalmente!
