# 🏅 ANÁLISE DE MEDALHAS E INTEGRAÇÃO COM "NA ROTA"

## 📊 MEDALHAS EXISTENTES (26 total)

### **CATEGORIA: CONFRATERNITY (7 medalhas)** 🤝
| ID | Nome | Pontos | Descrição | Requer Foto? |
|----|------|--------|-----------|--------------|
| `primeira_confraria` | Primeira Confraria | 50 | Realizou primeira confraternização | ✅ SIM |
| `anfitriao` | Anfitrião | 150 | Primeira confraternização como anfitrião | ✅ SIM |
| `cronista` | Cronista | 100 | Adicionou fotos em uma confraternização | ✅ SIM |
| `networker_ativo` | Networker Ativo | 100 | Realizou 5 confraternizações | ✅ SIM |
| `lider_confraria` | Líder de Confraria | 200 | Realizou 10 confraternizações | ✅ SIM |
| `mestre_conexoes` | Mestre das Conexões | 300 | Realizou 20 confraternizações | ✅ SIM |
| `presente` | Presente | 50 | Aceitou seu primeiro Elo | ❌ NÃO |

### **CATEGORIA: PORTFOLIO (3 medalhas)** 💼
| ID | Nome | Pontos | Descrição | Requer Foto? |
|----|------|--------|-----------|--------------|
| `cinegrafista_campo` | Cinegrafista de Campo | 30 | Primeiro upload de relatório/foto | ✅ SIM |
| `portfolio_premium` | Portfólio Premium | 100 | 10 fotos no portfólio total | ✅ SIM |
| `missao_cumprida` | Missão Cumprida | 100 | Marcar 1º serviço como concluído | ✅ SIM |

### **CATEGORIA: CONTRACTS (2 medalhas)** 📝
| ID | Nome | Pontos | Descrição | Requer Foto? |
|----|------|--------|-----------|--------------|
| `primeiro_sangue` | Primeiro Sangue | 50 | Primeira venda/contrato fechado | ⚠️ OPCIONAL |
| `fechador_elite` | Fechador de Elite | 500 | 50 contratos fechados total | ❌ NÃO |

### **CATEGORIA: MARKETPLACE (4 medalhas)** 🛒
| ID | Nome | Pontos | Descrição | Requer Foto? |
|----|------|--------|-----------|--------------|
| `primeira_venda_mkt` | Primeira Venda MKT | 50 | 1ª venda no marketplace | ⚠️ OPCIONAL |
| `vendedor_ativo` | Vendedor Ativo | 100 | 5 vendas no marketplace | ❌ NÃO |
| `comerciante` | Comerciante | 200 | 10 vendas no marketplace | ❌ NÃO |
| `mestre_marketplace` | Mestre do Marketplace | 400 | 20 vendas no marketplace | ❌ NÃO |

### **CATEGORIA: REVIEWS (1 medalha)** ⭐
| ID | Nome | Pontos | Descrição | Requer Foto? |
|----|------|--------|-----------|--------------|
| `batismo_excelencia` | Batismo de Excelência | 80 | Primeira avaliação 5 estrelas | ⚠️ OPCIONAL |
| `inabalavel` | Inabalável | 150 | Manter média 5★ após 5 trabalhos | ❌ NÃO |

### **OUTRAS CATEGORIAS (9 medalhas)** 🎯
| Categoria | Medalhas | Requerem Foto? |
|-----------|----------|----------------|
| **PROFILE** | Alistamento Concluído | ❌ NÃO |
| **NETWORKING** | Irmandade | ⚠️ OPCIONAL |
| **REFERRALS** | Recrutador | ❌ NÃO |
| **RESPONSIVENESS** | Pronto para a Missão | ❌ NÃO |
| **RETENTION** | Sentinela Inabalável | ❌ NÃO |
| **LOYALTY** | Sentinela de Elite | ❌ NÃO |
| **ENGAGEMENT** | Veterano da Rota | ❌ NÃO |
| **EXPERIENCE** | Veterano de Guerra | ⚠️ OPCIONAL |
| **SERVICES** | Missão Cumprida | ✅ SIM |

---

## 🎯 ESTRATÉGIA DE INTEGRAÇÃO

### **NÍVEL 1: OBRIGATÓRIO (10 medalhas)** ✅
**Medalhas que DEVEM ser validadas via "Na Rota":**

1. **primeira_confraria** - Foto da primeira confraria
2. **anfitriao** - Foto como anfitrião (hospedar)
3. **cronista** - Foto adicionada à confraria
4. **networker_ativo** - 5 confrarias comprovadas
5. **lider_confraria** - 10 confrarias comprovadas
6. **mestre_conexoes** - 20 confrarias comprovadas
7. **cinegrafista_campo** - Primeiro upload de foto/vídeo
8. **portfolio_premium** - 10 fotos no portfólio
9. **missao_cumprida** - Foto do serviço concluído
10. **veterano_guerra** - 20 serviços comprovados com foto

### **NÍVEL 2: OPCIONAL (5 medalhas)** ⚠️
**Medalhas que PODEM ser validadas via "Na Rota":**

1. **primeiro_sangue** - Foto do primeiro contrato (opcional)
2. **primeira_venda_mkt** - Foto da primeira venda (opcional)
3. **batismo_excelencia** - Screenshot da avaliação 5★ (opcional)
4. **irmandade** - Foto com membro contratado (opcional)
5. **inabalavel** - Screenshot das avaliações (opcional)

### **NÍVEL 3: AUTOMÁTICO (11 medalhas)** ❌
**Medalhas concedidas automaticamente pelo sistema:**

1. **presente** - Aceitar primeiro Elo (automático)
2. **fechador_elite** - 50 contratos (contador)
3. **vendedor_ativo** - 5 vendas (contador)
4. **comerciante** - 10 vendas (contador)
5. **mestre_marketplace** - 20 vendas (contador)
6. **alistamento_concluido** - Perfil 100% (automático)
7. **recrutador** - 3 indicações (contador)
8. **pronto_missao** - Responder rápido (automático)
9. **sentinela_inabalavel** - 30 dias ativo (automático)
10. **sentinela_elite** - 3 meses Elite (automático)
11. **veterano_rota** - 1 ano na plataforma (automático)

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: CONFRARIAS (6 medalhas)** 🤝

#### **Fluxo:**
1. Usuário agenda confraria
2. Data passa → Botão "Comprovar" aparece
3. Usuário posta foto → Vincula à confraria
4. Admin/IA valida → Sistema conta confrarias validadas
5. Sistema concede medalhas automaticamente:
   - 1ª confraria → `primeira_confraria`
   - É anfitrião → `anfitriao`
   - Tem foto → `cronista`
   - 5 confrarias → `networker_ativo`
   - 10 confrarias → `lider_confraria`
   - 20 confrarias → `mestre_conexoes`

#### **SQL para contar:**
```sql
-- Contar confrarias validadas do usuário
SELECT COUNT(*) FROM confraternity_invites
WHERE (sender_id = $userId OR receiver_id = $userId)
  AND proof_validated = true;
```

#### **Função de concessão:**
```typescript
async function checkConfraternityMedals(userId: string) {
  const { count } = await supabase
    .from('confraternity_invites')
    .select('*', { count: 'exact', head: true })
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('proof_validated', true)
  
  if (count === 1) await awardBadge(userId, 'primeira_confraria')
  if (count === 5) await awardBadge(userId, 'networker_ativo')
  if (count === 10) await awardBadge(userId, 'lider_confraria')
  if (count === 20) await awardBadge(userId, 'mestre_conexoes')
}
```

---

### **FASE 2: PORTFÓLIO/PROJETOS (4 medalhas)** 💼

#### **Fluxo:**
1. Usuário cria projeto no portfólio
2. Finaliza projeto → Botão "Comprovar Entrega" aparece
3. Usuário posta foto → Vincula ao projeto
4. Admin/IA valida → Sistema conta projetos validados
5. Sistema concede medalhas:
   - 1º projeto com foto → `cinegrafista_campo`
   - 1º serviço concluído → `missao_cumprida`
   - 10 fotos no portfólio → `portfolio_premium`
   - 20 serviços concluídos → `veterano_guerra`

#### **SQL para contar:**
```sql
-- Contar projetos validados
SELECT COUNT(*) FROM portfolio_items
WHERE user_id = $userId
  AND proof_validated = true;
```

---

### **FASE 3: VALIDAÇÃO POR IA** 🤖

#### **Regras de validação automática:**

**Confrarias:**
- ✅ Detectar 2+ pessoas na foto (OpenAI Vision)
- ✅ Verificar se é ambiente social (restaurante, escritório, etc)
- ✅ Aprovar automaticamente se confiança > 80%

**Projetos:**
- ✅ Detectar se é foto de trabalho/serviço
- ✅ Verificar qualidade da imagem
- ✅ Aprovar automaticamente se confiança > 70%

**Código:**
```typescript
async function validateWithAI(postId: string, type: 'confraternity' | 'project') {
  const post = await getPost(postId)
  
  const validation = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: type === 'confraternity' 
          ? 'Conte quantas pessoas aparecem nesta foto de confraternização'
          : 'Esta foto mostra um serviço/trabalho concluído?'
        },
        { type: 'image_url', image_url: { url: post.media_urls[0] } }
      ]
    }]
  })
  
  // Processar resposta e aprovar se confiança alta
  if (validation.confidence > 0.8) {
    await approveProof(postId)
  }
}
```

---

### **FASE 4: PAINEL ADMIN** 👨‍💼

#### **Página: `/admin/validations`**

**Seções:**
1. **Confrarias Pendentes**
   - Lista de confrarias aguardando validação
   - Preview de fotos
   - Botões: Aprovar / Rejeitar
   - Contador de pessoas (IA)

2. **Projetos Pendentes**
   - Lista de projetos aguardando validação
   - Preview de fotos
   - Botões: Aprovar / Rejeitar
   - Análise de qualidade (IA)

3. **Histórico**
   - Validações recentes
   - Estatísticas
   - Medalhas concedidas

---

## 🎨 ATUALIZAÇÃO DO CreatePostModal

### **Adicionar seletor de medalha:**

```typescript
const validationMedals = [
  // CONFRARIAS
  { id: 'primeira_confraria', name: '🤝 Primeira Confraria', requiresConfraternity: true },
  { id: 'anfitriao', name: '🏠 Anfitrião', requiresConfraternity: true },
  { id: 'cronista', name: '📸 Cronista', requiresConfraternity: true },
  
  // PORTFÓLIO
  { id: 'cinegrafista_campo', name: '🎥 Cinegrafista', requiresProject: false },
  { id: 'missao_cumprida', name: '✅ Missão Cumprida', requiresProject: true },
  { id: 'portfolio_premium', name: '⭐ Portfólio Premium', requiresProject: false },
  
  // OPCIONAIS
  { id: 'primeiro_sangue', name: '🎯 Primeiro Sangue', requiresProject: true },
  { id: 'batismo_excelencia', name: '⭐ Batismo de Excelência', requiresProject: false },
]
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Banco de Dados:**
- [x] Tabela `posts` com vinculações
- [x] Tabela `confraternity_invites` com comprovação
- [x] Tabela `portfolio_items` com comprovação
- [x] Views para listar pendentes
- [x] Funções de validação

### **Componentes:**
- [x] `CreatePostModal` com seletores
- [x] `PostCard` com badges
- [x] `ProofButton` para comprovar
- [ ] Atualizar modal com lista completa de medalhas
- [ ] Integrar ProofButton nas páginas

### **Lógica de Negócio:**
- [ ] Função para contar confrarias validadas
- [ ] Função para contar projetos validados
- [ ] Função para conceder medalhas automaticamente
- [ ] Integração com `awardBadge()`

### **Admin:**
- [ ] Painel de validação
- [ ] API de validação
- [ ] Notificações

### **IA:**
- [ ] Validação automática de confrarias
- [ ] Validação automática de projetos
- [ ] Análise de qualidade

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Atualizar CreatePostModal** com lista completa de medalhas
2. **Criar função de contagem** de confrarias/projetos
3. **Integrar com awardBadge()** após validação
4. **Criar painel admin** de validação
5. **Implementar IA** para validação automática

---

**Total de medalhas integradas: 15/26 (58%)**
- ✅ Obrigatórias: 10
- ⚠️ Opcionais: 5
- ❌ Automáticas: 11

**Sistema pronto para começar a validar!** 🎉
