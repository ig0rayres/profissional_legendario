# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 29/01/2026 - 22:39*

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
- **Credenciais em:** `.agent/EXECUTAR_SQL_SUPABASE.md`
- **Host:** db.erzprkocwzgdjrsictps.supabase.co
- **Porta:** 5432

---

## 🚨 PONTO DE RETOMADA - 29/01/2026

### **ÚLTIMA SESSÃO: 29/01/2026 - 22:00 às 22:39**

### **O QUE FOI FEITO HOJE:**

#### ✅ Marketplace - Webhook Stripe Corrigido
1. **Correção do campo** - `tier_id` → `ad_tier_id` no webhook
2. **Removido campo inexistente** - `stripe_payment_id` que não existe na tabela

#### ✅ Marketplace - Chat Integrado
1. **Botão "Entrar em Contato"** - Agora abre o chat diretamente na página do anúncio
2. **Evento `openChat`** - Disparado com o userId do vendedor
3. **Sem redirecionamento** - Melhor UX mantendo usuário na página

#### ✅ Marketplace - Banner Lendário
1. **Componente `LegendaryBanner`** - Carrossel épico para anúncios Lendários
2. **Bordas douradas animadas** - Efeito premium
3. **Navegação automática** - 5s por slide, pause no hover
4. **Integrado na home** - Aparece quando não há filtros ativos

#### ✅ Sistema de Temporadas - Banners Integrados
1. **4 novas colunas** - `banner_hero_url`, `banner_card_url`, `banner_sidebar_url`, `banner_square_url`
2. **API atualizada** - `compose-image` salva URLs automaticamente na temporada
3. **SeasonPromoBanner atualizado** - Usa `banner_sidebar_url` quando disponível
4. **Fallback inteligente** - Mostra layout de pódio se não houver banner

### **COMMITS DE HOJE:**
```
7255df13 - feat(seasons): integrar banners do admin ao painel do usuário
41a226ac - feat(seasons): redesenhar mini-banner de temporada estilo podium
de5746f0 - feat(marketplace): banner carrossel épico para anúncios Lendários
1374f20d - fix(marketplace): corrigir chat para abrir diretamente na página do anúncio
```

### **MIGRATIONS EXECUTADAS:**
```sql
-- Banners de temporada
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS banner_hero_url TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS banner_card_url TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS banner_sidebar_url TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS banner_square_url TEXT;
```

---

## 📁 DOCUMENTAÇÃO RELACIONADA

| Arquivo | Conteúdo |
|---------|----------|
| `.agent/context/CONTEXTO_PROJETO.md` | Este arquivo (ponto de retomada) |
| `.agent/context/AGENTS.md` | Personas dos agentes (Carlos, Marina, Lucas, Rafael) |
| `.agent/EXECUTAR_SQL_SUPABASE.md` | **⚠️ COMO EXECUTAR SQL DIRETO NO BANCO** |

---

## 🗄️ ESTRUTURA ADMIN

```
/admin
├── /                    → Dashboard geral
├── /users               → Gestão de usuários
├── /game                → Medalhas, proezas, ranks
├── /rota-valente        → Temporadas (prêmios, ranking, BANNERS)
├── /financeiro          → Dashboard, Planos, Comissões, Relatórios, Prêmios
├── /marketplace         → Anúncios, Tiers, Categorias
├── /pistas              → Oportunidades de negócio
├── /notifications       → Notificações
└── /categories          → Categorias profissionais
```

---

## 🔜 PRÓXIMOS PASSOS SUGERIDOS

1. **Testar banners de temporada** - Gerar no admin e verificar no dashboard
2. **Testar marketplace** - Criar anúncio Lendário e ver banner no topo
3. **Testar chat** - Verificar se "Entrar em Contato" abre o chat corretamente
4. **Grid Elite** - Implementar destaque para anúncios Elite (próximo passo)
5. **Melhorias UX** - Animações e responsividade mobile

---

*Fim do contexto. Boa sessão!*
