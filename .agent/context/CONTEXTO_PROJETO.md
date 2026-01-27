# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 27/01/2026 - 19:15*

> **INSTRUÇÃO:** No início de cada sessão, peça para o assistente ler este arquivo:
> `"leia o arquivo CONTEXTO_PROJETO.md"`

---

## 📋 SOBRE O PROJETO

**Nome:** Rota Business Club  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS  
**Descrição:** Plataforma de networking profissional com gamificação

**🌐 Deploy:** ✅ **PRODUÇÃO - ONLINE E CONFIGURADO**
- **URL Principal:** https://rotabusinessclub.com.br ✅
- **URL Alternativa:** https://rotabusinessclub.vercel.app
- **Hospedagem:** Vercel (plano Hobby)
- **DNS + CDN:** Cloudflare (ativo)
- **Email:** Resend (domínio verificado)
- **Banco de Dados:** Supabase PostgreSQL ✅

**🔌 Acesso Direto ao Banco:**
- **Credenciais (criptografadas):** `/home/igor/.gemini/credentials.enc`
- **Host:** db.erzprkocwzgdjrsictps.supabase.co
- **Porta:** 5432
- **Decodificar:** `cat /home/igor/.gemini/credentials.enc | base64 -d`
- **Conectar via psql:** `source <(cat ~/.gemini/credentials.enc | base64 -d) && PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p 5432 -d postgres -U postgres`

---

## 🚨 PONTO DE RETOMADA - 27/01/2026

### **ÚLTIMA SESSÃO: 27/01/2026 - 18:00 às 19:15**

### **O QUE FOI FEITO HOJE:**

#### ✅ Sistema de Temporadas (COMPLETO)
1. **Banco de dados** - seasons, season_prizes, season_winners
2. **Funções SQL** - get_active_season, get_season_ranking, get_user_season_position
3. **Admin: SeasonsManager** - Gerenciar prêmios, ranking, encerrar temporada
4. **Upload de imagens** - Banner da temporada + imagens dos prêmios
5. **Banner de divulgação** - SeasonPromoBanner (2 versões: compacta e épica)
6. **Encerramento de temporada** - Registra vencedores, cria próxima temporada
7. **Notificações e emails** - Para vencedores + campanha via Resend

#### ✅ IA dos Prêmios (DALL-E 3)
1. **Integração OpenAI** - SDK instalado, API configurada
2. **Prompts configuráveis** - `lib/config/image-enhancement-prompts.ts`
3. **Detecção de categoria** - eletrônicos, viagem, dinheiro, produto
4. **Prompts por posição** - ouro, prata, bronze
5. **Botão no admin** - "✨ Melhorar com IA"
6. **Documentação** - `.agent/context/IA_DOS_PREMIOS.md`

#### ✅ Pagamento de Prêmios (Pix)
1. **Campos no banco** - prize_value, pix_key, payment_status, paid_at
2. **PrizePaymentManager** - Lista vencedores, editar valor/Pix, marcar como pago
3. **Notificação automática** - Quando marcado como pago
4. **Admin > Financeiro > Prêmios**

#### ✅ Relatórios de Comissões
1. **Função SQL** - generate_monthly_commission_report()
2. **CommissionReportsManager** - Relatório mensal, exportar CSV
3. **Cards de resumo** - Total indicações, valor gerado, pago, pendente
4. **Admin > Financeiro > Relatórios**

### **COMMITS DE HOJE:**
```
ce846242 - feat: Sistema de Pagamento de Prêmios e Relatórios de Comissões
54b63bb4 - docs: Documentação IA dos Prêmios
64e413e5 - feat: Integração DALL-E 3 para imagens incríveis
533531ec - feat: Sistema de Melhoria de Imagens com IA
601e4efb - feat: Sistema de Banners de Temporada com upload de imagens
b5dc9f93 - feat: Admin Temporadas completo
51820ccc - feat: Sistema de Temporadas com ranking
```

---

## 📁 DOCUMENTAÇÃO RELACIONADA

| Arquivo | Conteúdo |
|---------|----------|
| `.agent/context/CONTEXTO_PROJETO.md` | Este arquivo (ponto de retomada) |
| `.agent/context/AGENTS.md` | Personas dos agentes (Carlos, Marina, Lucas, Rafael) |
| `.agent/context/IA_DOS_PREMIOS.md` | Prompts de IA para prêmios |
| `.agent/context/COMISSIONAMENTO_E_PREMIOS.md` | **NOVO** - Documentação completa |

---

## 🗄️ ESTRUTURA ADMIN

```
/admin
├── /                    → Dashboard geral
├── /users               → Gestão de usuários
├── /game                → Medalhas, proezas, ranks
├── /rota-valente        → Temporadas (prêmios, ranking)
├── /financeiro          → 7 abas:
│   ├── Dashboard        → Métricas financeiras
│   ├── Planos           → Recruta, Veterano, Elite
│   ├── Comissões        → Sistema de indicação
│   ├── Relatórios       → Relatórios mensais + exportar
│   ├── Prêmios          → Pagamento Pix vencedores
│   ├── Cupons           → Cupons de desconto
│   └── Campanhas        → Campanhas promocionais
├── /marketplace         → Anúncios
├── /pistas              → Oportunidades de negócio
├── /notifications       → Notificações
└── /categories          → Categorias profissionais
```

---

## 📋 FUNCIONALIDADES PRINCIPAIS

### **1. Gamificação**
- Sistema de XP e níveis
- Medalhas (26 cadastradas)
- Proezas mensais (8 cadastradas)
- Ranking mensal
- **Temporadas com prêmios** ✅ NOVO

### **2. Networking**
- Elos (conexões)
- Confrarias (encontros profissionais)
- Sistema de convites

### **3. Feed Social "Na Rota"**
- Posts com fotos
- Curtidas e comentários
- Posts de confraria aparecem para AMBOS participantes

### **4. Sistema Financeiro**
- Planos de assinatura (Stripe)
- Cupons de desconto
- **Comissões por indicação** ✅
- **Relatórios de comissões** ✅ NOVO
- **Pagamento de prêmios** ✅ NOVO

### **5. IA Integrada**
- **DALL-E 3** para imagens de prêmios ✅ NOVO
- OpenAI Vision (validação de fotos)

---

## 🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI (DALL-E 3 + Vision)
OPENAI_API_KEY=

# Email
RESEND_API_KEY=
```

---

## 🔜 PRÓXIMOS PASSOS SUGERIDOS

1. **Deploy Vercel** - Quando limite resetar
2. **Testar sistema de temporadas** - Fluxo completo
3. **Automatizar pagamentos Pix** - Integrar API de banco
4. **Hall da Fama** - Histórico público de vencedores
5. **Melhorias UX** - Animações, cores mais vibrantes

---

*Fim do contexto. Boa sessão!*
