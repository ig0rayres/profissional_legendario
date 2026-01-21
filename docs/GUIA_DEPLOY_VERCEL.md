# 🚀 Guia Definitivo de Deploy - Rota Business Club

**Última atualização:** 21/01/2026

---

## 📋 PRÉ-REQUISITOS

### Contas Necessárias
- ✅ GitHub (código-fonte)
- ✅ Vercel (hospedagem)
- ✅ Cloudflare (DNS + CDN)
- ✅ Supabase (banco de dados)
- ✅ Resend (email transacional)
- ⏳ Stripe (pagamentos - opcional)

---

## 🔧 CHECKLIST PRÉ-DEPLOY

### 1. Limpar arquivos sensíveis do Git

```bash
# Verificar o .gitignore
cat .gitignore

# Deve conter:
# - node_modules/
# - .next/
# - .env*
# - supabase/functions/
# - *.sql (scripts de desenvolvimento)
```

### 2. Remover arquivos do histórico (se necessário)

```bash
# Remover .env.local do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Remover node_modules do histórico
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch node_modules/" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin main --force
```

### 3. Verificar dependências

```bash
# Instalar todas as dependências
npm install

# Verificar se há dependências faltando
npm audit
```

### 4. Build local (SEMPRE fazer antes!)

```bash
# Testar build local
npm run build

# Se falhar, corrigir ANTES de fazer deploy
```

---

## 🐛 ERROS COMUNS E SOLUÇÕES

### ❌ Erro: "Cannot find module '@radix-ui/react-XXXX'"

**Solução:**
```bash
npm install @radix-ui/react-XXXX
git add package.json package-lock.json
git commit -m "fix: install missing radix dependency"
git push
```

### ❌ Erro: "Property 'XXXX' does not exist on type 'YYYY'"

**Causa:** TypeScript detectou inconsistência de tipos.

**Solução:**
1. Verificar o arquivo `types/database.ts`
2. Garantir que a propriedade existe no tipo
3. Se não existe, remover do código

### ❌ Erro: "Dynamic server usage: Route couldn't be rendered statically"

**Solução:** Adicionar no topo da API route:
```typescript
export const dynamic = 'force-dynamic'
```

### ❌ Erro: "useSearchParams() should be wrapped in suspense boundary"

**Solução:** Adicionar no `next.config.js`:
```javascript
experimental: {
  missingSuspenseWithCSRBailout: false,
}
```

### ❌ Erro: "await isn't allowed in non-async function"

**Causa:** Usar `await createClient()` em client component.

**Regra:**
- **Server components** (`@/lib/supabase/server`): `await createClient()`
- **Client components** (`@/lib/supabase/client`): `createClient()`

### ❌ Erro: Build falha com arquivos em `supabase/functions/`

**Solução:** Adicionar ao `.gitignore`:
```
supabase/functions/
```

---

## 📦 CONFIGURAÇÃO DO VERCEL

### 1. Criar Projeto

1. Acessar: https://vercel.com/new
2. Importar repositório GitHub
3. Nome do projeto: `rotabusinessclub`
4. Framework: Next.js (auto-detectado)
5. Root Directory: `./` (raiz)

### 2. Variáveis de Ambiente

**OBRIGATÓRIAS:**

| Variável | Valor | Onde Pegar |
|----------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://XXXX.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API (⚠️ Secreta!) |

**OPCIONAIS (adicionar depois):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

### 3. Build & Output Settings

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### 4. Cron Jobs (se aplicável)

⚠️ **Plano Hobby:** Apenas crons diários!

Exemplo `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/confraternity-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

---

## 🌐 CONFIGURAÇÃO DO CLOUDFLARE

### 1. Adicionar Domínio

1. Cloudflare → Add Site
2. Inserir: `rotabusinessclub.com.br`
3. Plano: Free
4. Copiar nameservers

### 2. Atualizar Registro.br

1. Acessar: https://registro.br
2. Login → Meus Domínios → `rotabusinessclub.com.br`
3. Editar DNS → Trocar nameservers
4. Colar nameservers do Cloudflare
5. Aguardar 15 min - 2h para propagação

### 3. Configurar Email Routing

**No Cloudflare:**
1. Email → Email Routing → Enable
2. Destination addresses → Add: `zmb4fun@gmail.com`
3. Routing rules:
   - `admin@rotabusinessclub.com.br` → `zmb4fun@gmail.com`
   - `noreply@rotabusinessclub.com.br` → Drop

### 4. Adicionar Domínio no Vercel

**No Vercel:**
1. Projeto → Settings → Domains
2. Add: `rotabusinessclub.com.br`
3. Add: `www.rotabusinessclub.com.br`
4. Copiar valores CNAME

**No Cloudflare:**
1. DNS → Add Record
2. Type: `CNAME`
3. Name: `@`
4. Target: `cname.vercel-dns.com`
5. Proxy: ✅ ON
6. Repetir para `www`

---

## 📧 CONFIGURAÇÃO DO RESEND

### 1. Adicionar Domínio

1. Resend → Domains → Add Domain
2. Inserir: `rotabusinessclub.com.br`
3. Copiar registros DNS

### 2. Adicionar DNS no Cloudflare

Copiar estes 3 registros do Resend para o Cloudflare:

| Type | Name | Value |
|------|------|-------|
| **TXT** | `@` | `v=spf1 include:_spf.resend.com ~all` |
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSq...` (DKIM) |
| **MX** | `send` | `feedback-smtp.resend.com` (Priority: 10) |

### 3. Verificar Domínio

⏳ Aguardar 15-60 min.

Resend → Domains → Status deve ficar **Verified** ✅

### 4. Configurar SMTP no Supabase

1. Supabase → Settings → Auth → SMTP Settings
2. Sender Name: `Rota Business Club`
3. Sender Email: `noreply@rotabusinessclub.com.br`
4. Host: `smtp.resend.com`
5. Port: `587`
6. Username: `resend`
7. Password: `re_XXXXXXXXX` (API Key do Resend)
8. Secure: ✅ TLS

---

## ✅ CHECKLIST DE DEPLOY

### Antes de fazer push

- [ ] `npm run build` local passou sem erros
- [ ] `.gitignore` atualizado
- [ ] Sem arquivos `.env` no Git
- [ ] Sem `node_modules/` no Git

### No Vercel

- [ ] Variáveis de ambiente configuradas
- [ ] Build passou sem erros
- [ ] Site acessível via URL `.vercel.app`

### No Cloudflare

- [ ] Domínio status: **Active**
- [ ] Email Routing funcionando
- [ ] DNS apontando para Vercel

### No Resend

- [ ] Domínio status: **Verified**
- [ ] SMTP configurado no Supabase

---

## 🔄 WORKFLOW DE DEPLOY CONTÍNUO

### Push para GitHub

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Vercel Auto-Deploy

✅ Vercel detecta push e faz deploy automático!

### Verificar Deploy

1. Vercel → Deployments
2. Clicar no último deploy
3. Ver logs de build
4. Se ✅ Ready → Acessa URL production

### Se falhar

1. Ver logs de erro
2. Corrigir código localmente
3. Fazer novo commit
4. Vercel tenta novamente

---

## 🆘 TROUBLESHOOTING

### Build passa local, mas falha no Vercel

**Possíveis causas:**
1. Node version diferente → Adicionar `.nvmrc`:
   ```
   18.17.0
   ```

2. Variáveis de ambiente faltando
3. Dependências não instaladas
4. Arquivos com case-sensitive (Mac/Linux vs Vercel)

### Deploy lento

**Otimizações:**
1. Reduzir tamanho de imagens
2. Lazy loading de componentes
3. Code splitting
4. Usar CDN para assets estáticos

### Erro 500 em produção

**Debug:**
1. Vercel → Deployment → Runtime Logs
2. Ver erro específico
3. Verificar variáveis de ambiente
4. Testar API routes com ferramenta REST

---

## 📱 MONITORAMENTO

### Vercel Analytics

1. Vercel → Analytics → Enable
2. Acompanhar:
   - Page views
   - Response time
   - Error rate

### Uptime Monitoring

Recomendado: https://uptimerobot.com

1. Criar conta
2. Add Monitor
3. URL: `https://rotabusinessclub.com.br`
4. Interval: 5 min
5. Alert via: Email

---

## 🎯 PRÓXIMAS MELHORIAS

- [ ] CI/CD com testes automáticos
- [ ] Preview deployments para PRs
- [ ] Lighthouse CI para performance
- [ ] Sentry para error tracking
- [ ] PostHog para analytics

---

## 📞 SUPORTE

**Vercel:** https://vercel.com/support  
**Cloudflare:** https://community.cloudflare.com  
**Resend:** https://resend.com/docs

**Documentação Interna:**
- `/docs/RESUMO_2026-01-21.md` - Sessão de deploy
- `/docs/ARQUITETURA_GAMIFICACAO.md` - Sistema de gamificação
- `/.gitignore` - Arquivos ignorados

---

**🔥 Bom Deploy! 🔥**
