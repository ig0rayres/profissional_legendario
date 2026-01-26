# 🤝 ELO DA ROTA - Guia de Implementação
**Sistema de Networking e Confraternizações**

---

## 📊 STATUS ATUAL

**Versão:** 1.0.0 - MVP  
**Data:** 16/01/2026  
**Status:** ✅ Pronto para Deploy

---

## ✅ O QUE FOI IMPLEMENTADO

### 🗄️ **Backend (Supabase)**
- ✅ 5 tabelas criadas
- ✅ 3 funções SQL
- ✅ 3 novas badges
- ✅ RLS policies configuradas
- ✅ Índices otimizados

### 💻 **API Layer**
- ✅ 9 funções TypeScript
- ✅ Integração com gamificação
- ✅ Validação de limites por plano
- ✅ Error handling completo

### 🎨 **Componentes React**
- ✅ 8 componentes criados
- ✅ Google Calendar integrado
- ✅ Upload de fotos
- ✅ Galerias responsivas

### 📱 **Páginas**
- ✅ Dashboard principal
- ✅ Convites pendentes
- ✅ Galeria pública/privada
- ✅ Componentes home/perfil

---

## 🚀 DEPLOY - PASSO A PASSO

### 1. **Executar SQL no Supabase**

```bash
# Arquivo: deploy_elo_da_rota.sql
# Executar no SQL Editor do Supabase
```

**O que faz:**
- Cria 5 tabelas
- Cria 3 funções SQL
- Adiciona 3 badges novas
- Configura RLS
- Cria índices

**Tempo:** ~2 minutos

---

### 2. **Verificar Credenciais**

Confirmar em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://erzprkocwzgdjrsictps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDQ3MzksImV4cCI6MjA4MDI4MDczOX0.nlRWPDuGXTcSUDwyZg9Z8eV6uab9vT2wmJiKe6x5EvM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwNDczOSwiZXhwIjoyMDgwMjgwNzM5fQ.TfoShhr4ZupYxpvYf6gG42ZP8Ql4k8s7sBbYeKoH3mM
```

---

### 3. **Instalar Dependências** (se necessário)

```bash
npm install date-fns
```

---

### 4. **Testar Localmente**

```bash
npm run dev
```

Acessar:
- http://localhost:3000/elo-da-rota
- http://localhost:3000/elo-da-rota/confraria/pendentes
- http://localhost:3000/elo-da-rota/confraria/galeria

---

## 📋 FUNCIONALIDADES

### ⚔️ **CONFRARIA (Confraternizações)**

**Fluxo completo:**
1. Usuário solicita confraria → +10 XP
2. Outro aceita → +10 XP (+ Google Calendar)
3. Realizam encontro presencial
4. Marcam como realizado → +50 XP
5. Upload até 5 fotos → +20 XP cada
6. Depoimento → +15 XP
7. Aparece na galeria

**Limites por plano:**
- Recruta: 0 convites/mês
- Veterano: 2 convites/mês
- Elite: 10 convites/mês

**Total XP possível:** até 185 XP por confraria

---

### 🏅 **NOVAS BADGES**

| Badge | XP | Critério |
|-------|-----|----------|
| Primeiro Encontro | 100 | Primeira confraria |
| Networker Ativo | 150 | 5 confraternizações |
| Mestre das Conexões | 500 | 20 confraternizações |

---

### 📅 **GOOGLE CALENDAR**

**Quando:** Ao aceitar convite  
**Como:** Botão "Adicionar ao Google Calendar"  
**Info incluída:**
- Título: "⚔️ Confraria com [Nome]"
- Data/hora proposta
- Local
- Descrição com dicas

---

### 🖼️ **GALERIAS**

**3 Localizações:**
1. **Home** - Top 6 confraternizações públicas
2. **Perfil** - Confraternizações do usuário
3. **Galeria Global** - Todas as públicas

**Visibilidade:**
- Recruta: privada (só participantes)
- Veterano/Elite: pública (aparece nas galerias)

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
/home/igor/Vídeos/Legendarios/
├── app/
│   └── elo-da-rota/
│       ├── page.tsx                      # Dashboard
│       └── confraria/
│           ├── pendentes/page.tsx        # Convites
│           └── galeria/page.tsx          # Galeria
├── components/
│   ├── confraternity/
│   │   ├── ConfraternityInviteForm.tsx
│   │   ├── ConfraternityInviteCard.tsx
│   │   ├── ConfraternityLimitsIndicator.tsx
│   │   ├── ConfraternityCompleteForm.tsx
│   │   ├── ConfraternityGallery.tsx
│   │   └── AddToCalendarButton.tsx
│   ├── home/
│   │   └── FeaturedConfraternities.tsx   # Home
│   └── profile/
│       └── UserConfraternities.tsx       # Perfil
├── lib/
│   ├── api/
│   │   └── confraternity.ts              # API Layer
│   └── utils/
│       └── calendar.ts                   # Google Calendar
└── deploy_elo_da_rota.sql                # SQL Deploy
```

---

## 🧪 TESTES

### Teste Manual - Checklist

- [ ] Executar SQL no Supabase
- [ ] Verificar tabelas criadas (5)
- [ ] Verificar badges adicionadas (3)
- [ ] Acessar `/elo-da-rota`
- [ ] Verificar indicador de limites
- [ ] Tentar solicitar confraria
- [ ] Aceitar convite
- [ ] Testar Google Calendar
- [ ] Marcar como realizado
- [ ] Upload de fotos
- [ ] Verificar galeria

### Teste SQL

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'confrat%';

-- Ver badges
SELECT * FROM badges 
WHERE id IN ('primeira_confraria', 'networker_ativo', 'mestre_conexoes');

-- Ver funções
SELECT proname FROM pg_proc 
WHERE proname LIKE '%confrat%';
```

---

## 🔐 SEGURANÇA

**Row Level Security (RLS):**
- ✅ Usuários veem apenas próprios convites
- ✅ Confraternizações públicas visíveis para todos
- ✅ Privadas apenas para participantes
- ✅ Limites verificados server-side

**Validações:**
- ✅ Limite de convites por plano
- ✅ Máximo 5 fotos por confraria
- ✅ Apenas participantes podem editar
- ✅ Anti-duplicação de convites

---

## 📈 MÉTRICAS

**KPIs para monitorar:**
- Total de confraternizações/mês
- Taxa de aceitação de convites
- Média de fotos por confraria
- % de confraternizações públicas vs privadas
- Uso do Google Calendar

**Queries úteis:**

```sql
-- Confraternizações este mês
SELECT COUNT(*) 
FROM confraternities 
WHERE date_occurred >= date_trunc('month', now());

-- Taxa de aceitação
SELECT 
    COUNT(*) FILTER (WHERE status = 'accepted')::float / 
    COUNT(*) * 100 as taxa_aceitacao
FROM confraternity_invites;

-- Top usuários
SELECT 
    user_id,
    COUNT(*) as total_confraternizacoes
FROM (
    SELECT member1_id as user_id FROM confraternities
    UNION ALL
    SELECT member2_id FROM confraternities
) combined
GROUP BY user_id
ORDER BY total_confraternizacoes DESC
LIMIT 10;
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Limite atingido"
**Causa:** Usuário atingiu limite mensal  
**Solução:** Aguardar reset (dia 1) ou fazer upgrade de plano

### Erro: Funções SQL não encontradas
**Causa:** SQL não executado  
**Solução:** Executar `deploy_elo_da_rota.sql`

### Fotos não aparecem
**Causa:** Bucket storage não configurado  
**Solução:** Verificar bucket "portfolio" no Supabase Storage

---

## 🚀 PRÓXIMOS PASSOS (Futuro)

### FASE 2 - Conexões (Elos)
- Sistema de solicitar elo
- Lista de conexões
- Sugestões inteligentes

### FASE 3 - Social
- Mensagens privadas
- Feed de atualizações
- Sistema de "Dar Vigor"

---

## 📞 SUPORTE

**Documentação:**
- Técnica: `/docs/GAMIFICATION_TECHNICAL.md`
- Usuário: `/docs/GAMIFICATION_USER_GUIDE.md`
- Integração: `/docs/GAMIFICATION_INTEGRATION_GUIDE.md`

**Arquivos:**
- SQL: `/deploy_elo_da_rota.sql`
- API: `/lib/api/confraternity.ts`
- Componentes: `/components/confraternity/*`

---

**Versão:** 1.0.0  
**Última atualização:** 16/01/2026  
**Status:** ✅ Pronto para Produção
