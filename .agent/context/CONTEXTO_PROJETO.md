# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 02/02/2026 - 22:45*

> **INSTRUÇÃO:** No início de cada sessão, peça para o assistente ler este arquivo:
> `"leia o arquivo CONTEXTO_PROJETO.md"`

---

## 🚨 REGRAS CRÍTICAS OBRIGATÓRIAS

**ATENÇÃO ASSISTENTE:** Antes de qualquer ação, leia e siga:

📜 **[REGRAS_CRITICAS.md](file:///home/igor/Vídeos/Legendarios/.agent/REGRAS_CRITICAS.md)**

**Resumo:**
1. ✅ Execute SQL direto no Supabase (não peça ao usuário)
2. ❌ Proibido hardcode - tudo vem do painel admin
3. ⚠️ Evite criar novos campos/tabelas
4. 🎯 Centralize dados - proibido duplicar informações

---

## 🚨 PONTO DE RETOMADA - 03/02/2026

### **PRIMEIRA TAREFA DO DIA:**

**Testar cenário de cookie de indicação:**
1. Acesse: `https://rotabusinessclub.com.br/r/igor-ayres`
2. **SAIA DO SITE** (feche ou navegue para outra página)
3. Volte direto em: `https://rotabusinessclub.com.br`
4. Clique em "Cadastrar" (sem ?ref= na URL)
5. Crie a conta e verifique se a indicação foi registrada

**Por que testar isso:** Garantir que o cookie de 30 dias funciona mesmo se o usuário sair do link e voltar depois.

---

### **ÚLTIMA SESSÃO: 02/02/2026 - 22:45**

#### ✅ **SISTEMA DE INDICAÇÃO AUTOMÁTICO** 🎯

**Duração:** ~2 horas (16 testes)  
**Status:** ✅ FUNCIONANDO EM PRODUÇÃO

##### **Problema Resolvido:**
- Indicações não eram registradas automaticamente
- Múltiplos pontos de falha (cookie, localStorage, API)

##### **Solução Implementada (à prova de falhas):**

```
FLUXO COMPLETO:
/r/slug → ?ref=slug → localStorage → signUp(user_metadata) → /profile/ensure → indicação ✅
           ↓
       cookie (30 dias) → fallback se voltar sem ?ref=
```

**Arquivos modificados:**
- `/app/r/[slug]/route.ts` - Seta cookie + redireciona com ?ref=
- `/app/auth/register/page.tsx` - Captura ?ref= ou lê cookie, salva localStorage
- `/lib/auth/context.tsx` - Passa referral_code no signUp e fallback
- `/app/api/profile/ensure/route.ts` - **PROCESSA INDICAÇÃO AUTOMATICAMENTE**

##### **Múltiplas fontes (por ordem):**
1. **URL param** (`?ref=slug`) - Prioridade máxima
2. **localStorage** - Persistido da sessão
3. **Cookie** (30 dias) - Fallback se fechar navegador

##### **Trigger atualizado:**
O trigger `handle_new_user` também foi atualizado para processar `referral_code` do user_metadata, mas o fallback `/profile/ensure` é executado primeiro na maioria dos casos.

---

#### ✅ **MEDALHA "ALISTAMENTO CONCLUÍDO"** 🎖️

**Status:** ✅ FUNCIONANDO

**Requisitos simplificados:**
- Nome completo ✅
- Bio ✅
- Avatar ✅

(Removidos: phone, pista - impediam concessão)

**Pontos:** 100 base + 50% bônus = 150 pts

---

## 📋 SOBRE O PROJETO

**Nome:** Rota Business Club  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS  
**Descrição:** Plataforma de networking profissional com gamificação

**🌐 Deploy:** ✅ **PRODUÇÃO - ONLINE E CONFIGURADO**
- **URL Principal:** https://rotabusinessclub.com.br ✅
- **Hospedagem:** Vercel (plano Hobby)
- **DNS + CDN:** Cloudflare (ativo)
- **Banco de Dados:** Supabase PostgreSQL ✅

**🔌 Acesso Direto ao Banco:**
- **Credenciais em:** `.agent/EXECUTAR_SQL_SUPABASE.md`
- **Host:** db.erzprkocwzgdjrsictps.supabase.co
- **Porta:** 5432

---

## 🔗 SISTEMA DE AFILIADOS

### **Como funciona:**

| Etapa | O que acontece |
|-------|----------------|
| 1. Link | `/r/igor-ayres` |
| 2. Redirect | `/auth/register?ref=igor-ayres` |
| 3. Cookie | Salvo por 30 dias |
| 4. localStorage | Salvo para a sessão |
| 5. signUp | Inclui `referral_code` no user_metadata |
| 6. /profile/ensure | Cria perfil + indicação |

### **Tabela referrals:**
- `referrer_id` - Quem indicou
- `referred_id` - Quem foi indicado
- `referral_code` - Slug do referrer
- `status` - pending/converted
- `converted_at` - Data de conversão

---

## 📁 DOCUMENTAÇÃO RELACIONADA

| Arquivo | Conteúdo |
|---------|----------|
| `.agent/context/CONTEXTO_PROJETO.md` | Este arquivo (ponto de retomada) |
| `.agent/context/AGENTS.md` | Personas dos agentes |
| `.agent/EXECUTAR_SQL_SUPABASE.md` | **⚠️ COMO EXECUTAR SQL DIRETO NO BANCO** |
| `lib/constants/plan-limits.ts` | **FONTE ÚNICA** de limites de planos |

---

## 🗄️ ESTRUTURA ADMIN

```
/admin
├── /                    → Dashboard geral
├── /users               → Gestão de usuários
├── /game                → Medalhas, proezas, ranks
├── /rota-valente        → Temporadas
├── /financeiro          → Planos, Comissões
├── /marketplace         → Anúncios
├── /pistas              → Oportunidades
└── /categories          → Categorias profissionais
```

---

## 🔜 PRÓXIMOS PASSOS

### **PRIORIDADE 1 - Testar Cookie de Indicação (03/02):**
1. Testar cenário: link → sair → voltar pelo site → cadastrar
2. Verificar se indicação é registrada pelo cookie

### **PRIORIDADE 2 - Outros módulos:**
1. Marketplace
2. Temporadas
3. Melhorias UX

---

*Fim do contexto. Boa sessão!*
