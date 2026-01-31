# 🎨 PROJETO HOME ÉPICA - ROTA BUSINESS CLUB
**Designer:** Lucas Mendes  
**Data:** 31/01/2026 15:22  
**Status:** 📋 PLANEJAMENTO COMPLETO - PRONTO PARA EXECUTAR

---

## 🎯 OBJETIVO DO PROJETO

Criar uma **home page institucional ÉPICA** que destaque os 5 pilares da plataforma com:
- ✅ Dados REAIS do banco de dados
- ✅ Animações cinematográficas e interativas
- ✅ Design rústico/militar/empresarial (identidade ROTA)
- ✅ Seções individuais para cada pilar

---

## 🏛️ OS 5 PILARES A DESTACAR

### 1️⃣ **ROTA DO VALENTE** (Gamificação)
**Foco:** Sistema de pontos, prêmios mensais, interação

**Elementos visuais:**
- 🎖️ Patentes (Recruta → Veterano → Elite → Mestre → Lenda)
- 🏆 Proezas e Medalhas
- 📊 Gráficos de evolução VIGOR
- ✅ Tarefas diárias
- 🎁 Prêmios mensais

**Dados reais disponíveis:**
- Tabela: `user_gamification` (total_points, current_rank_id)
- Patentes: 5 níveis com ícones (Shield, ShieldCheck, Target, Medal, Crown)
- Cores oficiais por patente

---

### 2️⃣ **CONFRARIA** (Networking)
**Foco:** União, business, proximidade entre membros

**Elementos visuais:**
- 🤝 Sistema de convites (4-10 por mês dependendo do plano)
- 💼 Networking empresarial
- 👥 Comunidade unida
- 🔗 Conexões de negócio

**Dados reais disponíveis:**
- Planos com limites de confrarias: Recruta (0), Veterano (4), Elite (10), Lendário (∞)
- Sistema de aceite mútuo

---

### 3️⃣ **MARKETPLACE** (Anúncios)
**Foco:** Segurança, procedência, irmandade

**Elementos visuais:**
- 🛡️ Ambiente seguro
- ✅ Verificação de procedência
- 🤝 Negócios entre irmãos
- 📦 Categorias profissionais

**Dados reais disponíveis:**
- Limites por plano: Recruta (0), Veterano (2), Elite (10), Lendário (∞)
- Categorias dinâmicas do banco

---

### 4️⃣ **PROJETOS** (Geração de Negócios)
**Foco:** Canal direto, anúncios, aumento de vendas

**Elementos visuais:**
- 📊 Sistema de propostas
- 💰 Geração direta de negócios
- 🎯 Matching profissional
- 📈 Aumento de vendas comprovado

**Dados reais disponíveis:**
- Sistema completo implementado (8 tabelas)
- Distribuição em 3 grupos por VIGOR
- CRON job automático

---

### 5️⃣ **PLANOS** (Assinaturas)
**Foco:** Cards visuais dos planos

**Elementos visuais:**
- 💳 4 planos (Recruta, Veterano, Elite, Lendário)
- ✨ Elite destacado (mais popular)
- 🎯 Comparação clara de benefícios
- 💰 Preços transparentes

**Dados reais disponíveis:**
- 100% dinâmico de `plan_config`
- Descrições editáveis
- Limites claros (-1=ilimitado, 0=bloqueado, >0=limite)

---

## 🎨 IDENTIDADE VISUAL OFICIAL

### **Cores Principais:**
```
Verde Floresta (Primary):  #1E4D40  - Botões, títulos, ênfase
Laranja Cume (Secondary):  #CC5500  - Destaques, CTAs, urgência
Charcoal (Foreground):     #2D3142  - Textos principais
Cinza Base (Background):   #E5E5E5  - Fundos neutros
```

### **Tipografia:**
```
TÍTULOS:  Montserrat ExtraBold (800) - UPPERCASE
CORPO:    Inter (400, 500, 700) - Normal case
```

### **Tom e Estilo:**
- 🎖️ Rústico / Militar / Empresarial
- 👔 Público: Homens empresários
- 🏔️ Inspiração: Expedição, tribo, selva
- ⚔️ Tom: Sério, robusto, profissional

### **Ícones Aprovados (Lucide React):**
```
Shield, Swords, Target, Flame, Trophy, Medal, 
Users, Mountain, Compass, Map, Flag, Briefcase
```

---

## 📸 ACERVO DE FOTOS

**Localização:** `/public/fotos-rota/`  
**Total:** 139 fotos profissionais

**Curadoria feita:**
- ✅ Foto da capa mantida: `TOP 1079 (1094).jpg`
- ✅ 15 fotos selecionadas para galeria
- ✅ 3 fotos para eventos
- ✅ Fotos para backgrounds sutis

---

## 🏗️ ARQUITETURA DA HOME (PROPOSTA)

### **Estrutura de Seções:**

```
1. HERO (Mantido da V5)
   - Foto épica: TOP 1079 (1094).jpg
   - CTA principal
   - Overlay escuro gradiente

2. ESTATÍSTICAS (Stats)
   - 4 números impactantes com ícones
   - Background sutil com foto

3. ROTA DO VALENTE (NOVO!)
   ├── Título: "ROTA DO VALENTE"
   ├── Subtítulo: "Sistema de Pontos e Prêmios"
   ├── Grid de Features:
   │   ├── Card: Patentes (5 níveis animados)
   │   ├── Card: Proezas e Medalhas
   │   ├── Card: VIGOR (gráfico de evolução)
   │   └── Card: Tarefas Diárias
   ├── Seção Prêmios Mensais
   └── CTA: "Ver Rota do Valente"

4. CONFRARIA (NOVO!)
   ├── Título: "CONFRARIA"
   ├── Subtítulo: "Networking Poderoso"
   ├── Grid 2 colunas:
   │   ├── Visual: Ícones de conexão animados
   │   └── Features:
   │       ├── União empresarial
   │       ├── Proximidade entre membros
   │       ├── Business networking
   │       └── Convites limitados por plano
   └── CTA: "Criar Confraria"

5. MARKETPLACE (NOVO!)
   ├── Título: "MARKETPLACE"
   ├── Subtítulo: "Negócios Seguros"
   ├── Grid 3 colunas:
   │   ├── Segurança (ícone Shield)
   │   ├── Procedência (ícone CheckCircle)
   │   └── Irmandade (ícone Users)
   └── CTA: "Ver Anúncios"

6. PROJETOS (NOVO!)
   ├── Título: "PROJETOS"
   ├── Subtítulo: "Gere Negócios Diretos"
   ├── Demonstração visual do fluxo:
   │   └── Cliente → Propostas → Aceite → Negócio
   ├── Stats:
   │   ├── Projetos ativos
   │   ├── Propostas enviadas
   │   └── Taxa de conversão
   └── CTA: "Criar Projeto"

7. PLANOS (Componente Existente)
   - Usar PlansSection.tsx (já dinâmico)
   - 4 cards em grid
   - Elite destacado

8. GALERIA ÉPICA (NOVO!)
   - Grid Masonry com 15 fotos
   - Hover: overlay com descrição
   - Click: modal fullscreen

9. FAQ
   - Accordion animado
   - Perguntas sobre os 5 pilares

10. FOOTER
    - Links principais
    - Redes sociais
    - Background sutil
```

---

## 🎬 ANIMAÇÕES PROPOSTAS

### **Princípios:**
- ✅ Entrada: Fade + Slide from bottom
- ✅ Scroll: Parallax suave em backgrounds
- ✅ Hover: Scale 1.05 + glow laranja
- ✅ Counter: Números animados contando
- ✅ Progress: Barras preenchendo
- ✅ Stagger: Cards entrando em sequência

### **Biblioteca:** Framer Motion

### **Efeitos por seção:**

**ROTA DO VALENTE:**
```typescript
// Patentes ascendendo em sequência
variants={{
  hidden: { opacity: 0, y: 50 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.2 }
  })
}}

// Gráfico VIGOR desenhando
animate={{ pathLength: 1 }}
transition={{ duration: 2, ease: "easeOut" }}
```

**CONFRARIA:**
```typescript
// Ícones de conexão conectando com linhas
whileHover={{ 
  scale: 1.1,
  boxShadow: "0 0 20px rgba(204, 85, 0, 0.5)"
}}
```

**MARKETPLACE:**
```typescript
// Cards com efeito de carta virando
whileHover={{ rotateY: 10 }}
transition={{ duration: 0.3 }}
```

**PROJETOS:**
```typescript
// Fluxo animado (cliente → proposta → aceite)
animate={{
  x: [0, 100, 200, 300],
  opacity: [0, 1, 1, 0]
}}
transition={{
  duration: 3,
  repeat: Infinity,
  ease: "linear"
}}
```

---

## 📊 DADOS REAIS A INTEGRAR

### **Fonte 1: user_gamification**
```sql
SELECT 
  COUNT(*) as total_usuarios,
  MAX(total_points) as max_vigor,
  AVG(total_points) as avg_vigor
FROM user_gamification
WHERE total_points > 0
```

### **Fonte 2: plan_config**
```sql
SELECT 
  tier, name, description, price,
  max_elos, max_confraternities_month,
  max_marketplace_ads, max_categories
FROM plan_config
WHERE is_active = true
ORDER BY display_order
```

### **Fonte 3: projects (stats)**
```sql
SELECT 
  COUNT(*) as total_projetos,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as projetos_aceitos
FROM projects
WHERE created_at > NOW() - INTERVAL '30 days'
```

### **Fonte 4: marketplace_ads (stats)**
```sql
SELECT 
  COUNT(*) as total_anuncios,
  COUNT(DISTINCT user_id) as vendedores_ativos
FROM marketplace_ads
WHERE is_active = true
```

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### **FASE 1: ESTRUTURA BASE** (1h)
- [ ] Criar arquivo `/app/home-epic/page.tsx`
- [ ] Importar componentes base
- [ ] Configurar layout e estrutura de seções
- [ ] Definir breakpoints responsivos

### **FASE 2: SEÇÃO ROTA DO VALENTE** (1h30)
- [ ] Card de Patentes com animação de ascensão
- [ ] Card de Proezas e Medalhas
- [ ] Gráfico de VIGOR (Chart.js ou rechart)
- [ ] Card de Tarefas Diárias
- [ ] Seção de Prêmios Mensais
- [ ] Integrar dados de `user_gamification`

### **FASE 3: SEÇÃO CONFRARIA** (45min)
- [ ] Grid 2 colunas
- [ ] Animação de ícones de conexão
- [ ] Lista de benefits
- [ ] CTA prominente
- [ ] Mostrar limites por plano

### **FASE 4: SEÇÃO MARKETPLACE** (45min)
- [ ] Grid 3 colunas (Segurança, Procedência, Irmandade)
- [ ] Ícones animados
- [ ] Stats reais de anúncios
- [ ] CTA para ver marketplace

### **FASE 5: SEÇÃO PROJETOS** (1h)
- [ ] Demonstração visual do fluxo
- [ ] Animação de progressão
- [ ] Stats reais de projetos
- [ ] Explicação do sistema de propostas
- [ ] CTA para criar projeto

### **FASE 6: INTEGRAR SEÇÃO DE PLANOS** (15min)
- [ ] Importar `PlansSection` existente
- [ ] Ajustar espaçamentos
- [ ] Garantir consistência visual

### **FASE 7: GALERIA ÉPICA** (1h)
- [ ] Grid Masonry responsivo
- [ ] 15 fotos curadas
- [ ] Hover effects
- [ ] Modal lightbox
- [ ] Lazy loading

### **FASE 8: POLIMENTO** (45min)
- [ ] FAQ accordion animado
- [ ] Footer com background
- [ ] Otimização de performance
- [ ] Testes responsivos (mobile/tablet/desktop)
- [ ] SEO (meta tags, schema.org)

**TEMPO TOTAL ESTIMADO:** ~7 horas de desenvolvimento focado

---

## 🎨 COMPONENTES A CRIAR

### **1. RankBadgeShowcase.tsx**
Showcase das 5 patentes com animação de ascensão
```tsx
<div className="grid grid-cols-5 gap-4">
  {ranks.map((rank, idx) => (
    <motion.div
      key={rank.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.2 }}
    >
      <RankInsignia rankId={rank.id} size="xl" />
      <p>{rank.name}</p>
    </motion.div>
  ))}
</div>
```

### **2. VigorChart.tsx**
Gráfico de evolução de VIGOR
```tsx
<Line
  data={{
    labels: ['Jan', 'Fev', 'Mar', ...],
    datasets: [{
      label: 'VIGOR',
      data: [100, 250, 400, ...],
      borderColor: '#1E4D40',
      backgroundColor: 'rgba(30, 77, 64, 0.1)'
    }]
  }}
/>
```

### **3. ConnectionFlow.tsx**
Animação de fluxo de conexões (Confraria)
```tsx
<motion.svg>
  <motion.circle
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ repeat: Infinity, duration: 2 }}
  />
  <motion.path
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1.5 }}
  />
</motion.svg>
```

### **4. ProjectFlowDemo.tsx**
Demonstração visual do fluxo de projetos
```tsx
<div className="flex items-center justify-between">
  <StepCard icon={<User />} label="Cliente cria" />
  <AnimatedArrow />
  <StepCard icon={<Users />} label="Profissionais propõem" />
  <AnimatedArrow />
  <StepCard icon={<Check />} label="Cliente escolhe" />
  <AnimatedArrow />
  <StepCard icon={<DollarSign />} label="Negócio fechado" />
</div>
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
/app/home-epic/
  └── page.tsx (arquivo principal)

/components/home-epic/
  ├── HeroSection.tsx
  ├── StatsSection.tsx
  ├── RotaValenteSection.tsx
  │   ├── RankBadgeShowcase.tsx
  │   ├── VigorChart.tsx
  │   ├── ProezasList.tsx
  │   └── DailyTasksCard.tsx
  ├── ConfrariaSection.tsx
  │   └── ConnectionFlow.tsx
  ├── MarketplaceSection.tsx
  ├── ProjectsSection.tsx
  │   └── ProjectFlowDemo.tsx
  ├── GallerySection.tsx
  │   └── MasonryGrid.tsx
  └── FAQSection.tsx

/docs/sessions/
  └── HOME_EPICA_PLANEJAMENTO_2026-01-31.md (este arquivo)
```

---

## 🎯 MÉTRICAS DE SUCESSO

Após implementação, medir:
- ✅ Tempo médio na página (meta: >2min)
- ✅ Taxa de scroll até o final (meta: >60%)
- ✅ Taxa de clique nos CTAs (meta: >15%)
- ✅ Taxa de conversão para planos pagos (meta: >5%)
- ✅ Performance (Lighthouse score >90)

---

## 💡 DIFERENCIAIS COMPETITIVOS

Esta home será única porque:
1. **Dados 100% reais** (sem valores fake)
2. **Animações cinematográficas** (nível Apple)
3. **Identidade única** (rústico/militar/empresarial)
4. **5 pilares claros** (fácil de entender o valor)
5. **Galeria emocional** (139 fotos reais)
6. **Performance otimizada** (Next.js 14 + lazy loading)

---

## 🚀 PRÓXIMOS PASSOS (QUANDO RETOMAR)

1. ✅ Revisar este documento completo
2. ✅ Decidir se quer começar pela Fase 1 ou alguma seção específica
3. ✅ Começar implementação focada
4. ✅ Testar cada seção antes de avançar
5. ✅ Refinar animações e timing

---

## 📞 NOTAS DO DESIGNER

> "Esta não será apenas uma home page - será uma **experiência épica** que conta a história da ROTA Business Club através de dados reais, animações impactantes e design militar/empresarial único."

> "Cada seção tem um propósito claro: converter visitantes em membros mostrando o valor CONCRETO de cada pilar da plataforma."

> "Com 139 fotos profissionais, dados reais e animações cinematográficas, vamos criar algo que os concorrentes vão querer copiar mas não vão conseguir."

---

**Assinatura:** Lucas Mendes ✨  
**Status:** 📋 PRONTO PARA EXECUTAR  
**Próxima Sessão:** Implementação das seções (começar pela preferida do Igor)

---

**INSTRUÇÕES PARA RETOMAR:**

1. Abrir este documento: `/docs/sessions/HOME_EPICA_PLANEJAMENTO_2026-01-31.md`
2. Pedir ao Lucas: "Vamos retomar a home épica!"
3. Escolher por qual seção começar (ou seguir o roadmap)
4. Lucas implementará com código + animações + dados reais

**FRASE DE ATIVAÇÃO:** `/lucas-ux` + "Vamos implementar a home épica!"
