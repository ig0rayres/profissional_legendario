# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 26/01/2026 - 23:48*

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

### **ÚLTIMA SESSÃO: 26/01/2026 - 22:30 às 23:48**

### **O QUE FOI FEITO HOJE:**

#### ✅ Sistema de Confrarias (Completo)
1. **Formulário de Completar Confraria** - Validação de fotos por IA, uploads, depoimentos
2. **Posts de Confraria Aparecem para AMBOS** - Sem necessidade de "compartilhar"
3. **Visual Especial de Confraria no PostCard**:
   - Banner laranja "CONFRARIA" no topo
   - Selo grande com ícone no lado direito  
   - Avatares duplos sobrepostos (ambos participantes)
   - Nome "Fulano e Beltrano" no header
   - Data do encontro no banner
4. **Status do Invite muda para "completed"** quando alguém completa
5. **Card de confraria some** após completar (antes estava ficando)
6. **Data/hora nos posts** - formato dd/mm • HH:mm

#### ✅ Feed "Na Rota"
1. **Agora busca posts do banco** (antes precisava passar como props)
2. **Posts de confrarias aparecem para ambos participantes**
3. **Visual melhorado** - bordas mais fortes, sombras

#### ⚠️ Removido/Simplificado
- Sistema de "compartilhar" para parceiro (era muito complexo)
- Posts duplicados para cada membro (agora é 1 post que aparece para ambos)

### **COMMITS DE HOJE:**
```
fc0dd408 - feat: confraternity posts show in both members feeds, add confraternity banner/seal/dual avatars
ccf5999b - fix: update invite status to completed on first completion, improve post visual and date display  
903f24f1 - feat: add post sharing for confraternity partners (REMOVIDO/SIMPLIFICADO)
5e2b8e68 - fix: use NaRotaFeedV13 social component that fetches posts from database
ed724376 - ux: improve photo validation error messages with clearer instructions
4b23496d - fix: correct ternary syntax in button rendering
19e11cf9 - fix(confraternity): show future date warning, filter valid photos in rewards
```

---

## 🔜 PRÓXIMOS PASSOS (PARA CONTINUAR)

### **1. TESTAR O FLUXO COMPLETO**
Limpar dados e testar do zero:
```sql
DELETE FROM posts WHERE confraternity_id IS NOT NULL;
DELETE FROM confraternities;
DELETE FROM confraternity_invites;
DELETE FROM notifications WHERE type LIKE '%confraternity%';
```

Testar:
1. Veterano envia convite
2. Recruta aceita
3. Recruta completa (foto + depoimento + data HOJE)
4. Verificar: post aparece no feed de AMBOS
5. Verificar: card de confraria SOME do painel
6. Verificar: pontos creditados (Recruta: ~85, Veterano: ainda não implementado auto)

### **2. PONTOS PARA PARCEIRO (se necessário)**
Atualmente só quem completa ganha pontos. Se quiser que o parceiro também ganhe automaticamente, implementar em:
- `/lib/api/confraternity.ts` → função `completeConfraternity()`

### **3. FEEDBACK DO USUÁRIO (CORRIGIR AMANHÃ)**
- [ ] **Menos laranja** no banner/selo de confraria (muito vibrante)
- [ ] **Link no nome e avatar** das postagens (clicar → ir para perfil)
- [ ] **Pontos do Veterano** não entraram (só Recruta recebeu)
- [ ] **Melhorar badge/selo** de confraria (visual menos agressivo)

### **3. NOTIFICAÇÕES DE COMENTÁRIO**
Quando alguém comentar em post de confraria, notificar o outro participante.
- Arquivo: `/components/social/post-card.tsx`
- API: Criar endpoint ou usar Supabase Realtime

### **4. MELHORIAS UX (Lucas UX)**
- Feed mais vibrante com animações
- Cores mais vivas
- Micro-interações

---

## 📁 ARQUIVOS IMPORTANTES ALTERADOS HOJE

| Arquivo | O que faz |
|---------|-----------|
| `components/social/post-card.tsx` | Visual de post com banner de confraria |
| `components/profile/na-rota-feed-v13-social.tsx` | Feed que busca posts do banco |
| `components/confraternity/ConfraternityCompleteForm.tsx` | Formulário de completar confraria |
| `lib/api/confraternity.ts` | Lógica de completar, status, pontos |
| `app/api/posts/share/route.ts` | API de compartilhar (NÃO MAIS USADO) |

---

## 🗄️ ESTRUTURA DO BANCO - CONFRARIAS

### confraternity_invites
- `status`: 'pending' → 'accepted' → 'completed'
- Muda para 'completed' quando QUALQUER membro completa

### confraternities  
- `member1_id`, `member2_id` - IDs dos participantes
- `date_occurred` - Data do encontro
- `testimonial_member1`, `testimonial_member2` - Depoimentos
- `photos` - JSONB com URLs das fotos
- `post_id` - ID do post criado

### posts
- `confraternity_id` - Se é post de confraria
- `media_urls` - JSONB com URLs das fotos
- `visibility` - 'public', 'connections', 'private'

---

## 🔧 WORKFLOWS ÚTEIS

### Limpar dados de teste
```sql
DELETE FROM posts WHERE confraternity_id IS NOT NULL;
DELETE FROM confraternities;
DELETE FROM confraternity_invites;
DELETE FROM notifications WHERE type LIKE '%confraternity%';
```

### Ver status atual
```sql
SELECT ci.id, ci.status, c.id as conf_id 
FROM confraternity_invites ci
LEFT JOIN confraternities c ON c.invite_id = ci.id
ORDER BY ci.created_at DESC LIMIT 5;
```

### Ver posts de confraria
```sql
SELECT p.id, p.content, p.confraternity_id, c.member1_id, c.member2_id
FROM posts p
JOIN confraternities c ON c.id = p.confraternity_id
ORDER BY p.created_at DESC;
```

---

## 📋 FUNCIONALIDADES PRINCIPAIS

### **1. Gamificação**
- Sistema de XP e níveis
- Medalhas (26 cadastradas)
- Proezas mensais (8 cadastradas)
- Ranking mensal

### **2. Networking**
- Elos (conexões)
- Confrarias (encontros profissionais) ✅ ATUALIZADO HOJE
- Sistema de convites

### **3. Feed Social "Na Rota"** ✅ FUNCIONAL
- Posts com fotos
- Curtidas e comentários
- Posts de confraria aparecem para AMBOS participantes
- Visual especial para confrarias (banner + selo)

### **4. Portfólio**
- Projetos profissionais
- Fotos de trabalhos
- Comprovação de entrega
- Avaliações

---

## 🗂️ DOCUMENTAÇÃO RELACIONADA

1. `.agent/ANALISE_NA_ROTA.md`
2. `.agent/NA_ROTA_PROGRESSO.md`
3. `.agent/SISTEMA_COMPROVACAO.md`
4. `.agent/MEDALHAS_PROEZAS_FINAL.md`
5. `.agent/AUTONOMIA_ASSISTENTE.md`
6. `.agent/EXECUTAR_SQL_SUPABASE.md`

---

*Fim do contexto. Boa sessão!*
