# 🔧 REGRAS E PADRÕES DE DESENVOLVIMENTO

*Atualizado: 29/01/2026*

---

## ⛔ REGRA #1: NUNCA USE HARDCODED

### **PROIBIDO:**
- Listas de planos hardcoded
- Listas de categorias hardcoded
- Listas de pistas hardcoded
- Valores fixos que podem mudar

### **OBRIGATÓRIO:**
- **Planos** → Buscar da tabela `plan_tiers`
- **Categorias** → Buscar da tabela `service_categories`
- **Pistas** → Buscar da tabela `pistas`
- **Ranks** → Buscar da tabela `ranks`
- **Medalhas** → Buscar da tabela `medals`
- **Proezas** → Buscar da tabela `proezas`

### **Exemplo ERRADO:**
```typescript
// ❌ NUNCA FAÇA ISSO
const PLANS = [
    { id: 'recruta', name: 'Recruta' },
    { id: 'veterano', name: 'Veterano' },
    { id: 'elite', name: 'Elite' }
]
```

### **Exemplo CORRETO:**
```typescript
// ✅ SEMPRE BUSQUE DO BANCO
const [plans, setPlans] = useState<Plan[]>([])

useEffect(() => {
    async function loadPlans() {
        const { data } = await supabase
            .from('plan_tiers')
            .select('id, name')
            .order('monthly_price')
        if (data) setPlans(data)
    }
    loadPlans()
}, [])
```

---

## 📊 TABELAS DE REFERÊNCIA

| Dado | Tabela | Campos principais |
|------|--------|-------------------|
| Planos de assinatura | `plan_tiers` | id, name, monthly_price |
| Categorias de serviço | `service_categories` | id, name, slug, active |
| Pistas | `pistas` | id, name, slug |
| Ranks de gamificação | `ranks` | id, name, rank_level, points_required |
| Medalhas | `medals` | id, name, icon_key, points_reward |
| Proezas | `proezas` | id, name, points_base, is_active |
| Usuários | `profiles` | id, full_name, email, pista |
| Assinaturas | `subscriptions` | user_id, plan_id, status |

---

## 🔗 FILTROS POR PLANO

Para filtrar usuários por plano, é necessário:

1. Buscar `user_id` na tabela `subscriptions` pelo `plan_id`
2. Usar esses IDs para filtrar na tabela `profiles`

```typescript
// Buscar usuários de um plano específico
const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('plan_id', 'veterano')
    .eq('status', 'active')

const userIds = subs?.map(s => s.user_id) || []

const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)
```

---

## 📝 CHECKLIST PRÉ-COMMIT

Antes de commitar, verifique:

- [ ] Nenhuma lista hardcoded de dados mutáveis
- [ ] Todos os filtros buscam do banco
- [ ] Queries validados e funcionando
- [ ] Build passa sem erros

---

*Mantenha este arquivo atualizado!*
