# 🏗️ ARQUITETURA - PÁGINA DE PERFIL DE USUÁRIO

## 🎯 OBJETIVO:
Página centralizada e completa do perfil do usuário, servindo como **hub principal** de todas informações e conquistas.

---

## 📊 SEÇÕES DA PÁGINA (em ordem):

### **1. HEADER - Identificação**
- ✅ Avatar (grande, circular)
- ✅ Nome completo
- ✅ Email
- ✅ ID Rota Business
- ✅ Localização (pista)
- ✅ Data de cadastro
- ⚠️ Badge do Plano (Recruta/Veterano/Elite) com cor diferenciada

### **2. CARD DE GAMIFICAÇÃO - "Status Rota do Valente"**
**Dados a exibir:**
- ✅ **Patente Atual** 
  - Ícone grande (RankInsignia)
  - Nome da patente
  - Barra de progresso para próxima patente
  - Pontos atuais / Pontos necessários
  
- ✅ **Plano & Multiplicador**
  - Nome do plano
  - Badge colorido
  - Multiplicador de XP visível

- ✅ **Vigor Total**
  - Número grande destacado
  - Gráfico de evolução (futuro)

- ✅ **Medalhas**
  - Total conquistadas
  - Link para ver todas

**Fonte de dados:**
```typescript
// Query unificada
const gamificationData = await supabase
  .from('user_gamification')
  .select(`
    *,
    ranks (id, name, rank_level, points_required, icon),
    user_medals (
      medal_id,
      earned_at,
      medals (id, name, icon, description, points_reward)
    )
  `)
  .eq('user_id', userId)
  .single()

const subscription = await supabase
  .from('subscriptions')
  .select('plan_id, plan_tiers(*)')
  .eq('user_id', userId)
  .single()
```

---

### **3. CARD DE MEDALHAS - "Troféus & Conquistas"**
**Layout:**
- Grid 4x4 de medalhas
- Medalhas conquistadas: coloridas (MedalBadge)
- Medalhas bloqueadas: opacas/cinza
- Hover: mostra nome + descrição + pontos
- Click: modal com detalhes completos

**Dados:**
```typescript
// Todas medalhas disponíveis
const allMedals = await supabase
  .from('medals')
  .select('*')
  .order('id')

// Medalhas do usuário
const userMedals = await supabase
  .from('user_medals')
  .select('medal_id, earned_at')
  .eq('user_id', userId)

// Merge: marcar quais foram conquistadas
```

---

### **4. CARD DE CONFRARIA - "Atividades Sociais"**
**Dados a exibir:**
- ✅ Total de Confraternities criadas
- ✅ Total de Confraternities participadas
- ✅ Próximo evento agendado
- ✅ Últimas fotos da galeria (preview 4-6 fotos)
- ✅ Button: "Ver Galeria Completa"

**Fonte:**
```typescript
const confraternityStats = await supabase
  .from('confraternity_events')
  .select('id, created_at, acceptances(*), photos(*)')
  .or(`creator_id.eq.${userId},acceptances.user_id.eq.${userId}`)
```

---

### **5. CARD DE PORTFÓLIO - "Serviços & Trabalhos"**
**Para profissionais:**
- ✅ Grid de fotos dos serviços
- ✅ Título de cada trabalho
- ✅ Descrição curta
- ✅ Data de realização
- ✅ Tags/categorias

**Fonte:**
```typescript
const portfolio = await supabase
  .from('portfolio_items')
  .select('*')
  .eq('user_id', userId)
  .order('display_order')
```

**⚠️ PENDENTE:** Criar tabela `portfolio_items`

---

### **6. CARD DE AVALIAÇÕES - "Reputação"**
**Dados:**
- ✅ Rating médio (estrelas grandes)
- ✅ Total de avaliações
- ✅ Distribuição (5★: X, 4★: Y...)
- ✅ Lista de últimas 5 avaliações
  - Nome do avaliador
  - Estrelas
  - Comentário
  - Data
- ✅ Button: "Ver Todas"

**Fonte:**
```typescript
const ratings = await supabase
  .from('ratings')
  .select(`
    *,
    reviewer:profiles!ratings_reviewer_id_fkey(full_name, avatar_url)
  `)
  .eq('professional_id', userId)
  .order('created_at', { ascending: false })
  .limit(5)

// Rating médio
const { data: avgRating } = await supabase
  .rpc('calculate_average_rating', { professional_id: userId })
```

---

### **7. SIDEBAR - Informações de Contato**
- ✅ Email
- ✅ Telefone
- ✅ WhatsApp (link direto)
- ✅ Redes sociais (futuro)
- ✅ Site pessoal (futuro)

---

## 🗄️ ESTRUTURA DE DADOS CENTRALIZADA

### **Query Master Unificada:**

```typescript
export async function getUserProfileData(userId: string) {
  const supabase = await createClient()
  
  // 1. Profile básico
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  // 2. Gamificação completa
  const { data: gamification } = await supabase
    .from('user_gamification')
    .select(`
      *,
      ranks!current_rank_id(*),
      user_medals(
        medal_id,
        earned_at,
        medals(*)
      )
    `)
    .eq('user_id', userId)
    .single()
  
  // 3. Subscription & Plano
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, plan_tiers(*)')
    .eq('user_id', userId)
    .single()
  
  // 4. Todas medalhas (para mostrar bloqueadas)
  const { data: allMedals } = await supabase
    .from('medals')
    .select('*')
    .order('id')
  
  // 5. Estatísticas Confraria
  const { data: confraternityStats } = await supabase
    .rpc('get_user_confraternity_stats', { p_user_id: userId })
  
  // 6. Portfolio
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', userId)
    .order('display_order')
  
  // 7. Ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select(`
      *,
      reviewer:profiles!ratings_reviewer_id_fkey(full_name, avatar_url)
    `)
    .eq('professional_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  const { data: ratingStats } = await supabase
    .rpc('get_rating_stats', { p_professional_id: userId })
  
  return {
    profile,
    gamification,
    subscription,
    allMedals,
    confraternityStats,
    portfolio,
    ratings,
    ratingStats
  }
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
/app/professional/[id]/
  page.tsx                    → Página principal (usa getUserProfileData)

/lib/profile/
  queries.ts                  → getUserProfileData() centralizado
  types.ts                    → TypeScript interfaces

/components/profile/
  profile-header.tsx          → Header com avatar + info básica
  gamification-card.tsx       → Card de status Rota do Valente (NOVO)
  medals-grid.tsx             → Grid de medalhas (NOVO)
  confraternity-stats.tsx     → Stats de confraria (NOVO)
  portfolio-section.tsx       → Seção de portfólio
  ratings-section.tsx         → Seção de avaliações
  contact-sidebar.tsx         → Sidebar de contato
```

---

## ⚠️ PENDÊNCIAS PARA IMPLEMENTAR:

### **Banco de Dados:**
- [ ] Criar tabela `portfolio_items`
- [ ] Criar function `get_user_confraternity_stats()`
- [ ] Criar function `get_rating_stats()`

### **Componentes:**
- [ ] Criar `gamification-card.tsx`
- [ ] Criar `medals-grid.tsx`
- [ ] Criar `confraternity-stats.tsx`
- [ ] Atualizar `profile-header.tsx` para badges de plano

### **Queries:**
- [ ] Criar `/lib/profile/queries.ts` com `getUserProfileData()`
- [ ] Criar types em `/lib/profile/types.ts`

---

## 🎯 PLANO DE IMPLEMENTAÇÃO (ORDEM):

1. ✅ **FASE 1:** Criar estrutura de dados
   - SQL: Tabelas e functions
   - Types: Interfaces TypeScript
   - Queries: getUserProfileData()

2. ✅ **FASE 2:** Componentes visuais
   - GamificationCard
   - MedalsGrid
   - ConfraternityStat
s
   - Atualizar ProfileHeader

3. ✅ **FASE 3:** Integrar na página
   - Atualizar /professional/[id]/page.tsx
   - Testar com contas Recruta, Veterano, Elite

4. ✅ **FASE 4:** Polimento
   - Loading states
   - Error handling
   - Animações
   - Responsivo

---

## ✅ APROVAÇÃO NECESSÁRIA:

**Antes de implementar, confirme:**
- [ ] Estrutura de seções está correta?
- [ ] Faltou alguma informação importante?
- [ ] Ordem das seções faz sentido?
- [ ] Tem alguma feature adicional para incluir?

**Após aprovação, começamos pela FASE 1!**
