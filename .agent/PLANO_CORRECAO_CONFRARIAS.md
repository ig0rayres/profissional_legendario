# 🔧 PLANO DE CORREÇÃO DEFINITIVO - CONFRARIAS
**Data:** 26/01/2026 21:35
**Status:** 🔴 EM EXECUÇÃO

---

## 📋 CHECKLIST DE PROBLEMAS

### 🔴 PRIORIDADE ALTA (Bugs Críticos)

#### PROBLEMA #2: Data pode ser FUTURA
- **Sintoma:** Usuário selecionou 27/01/2026 (amanhã) como data da confraria
- **Causa:** Falta validação de data no frontend
- **Solução:** Validar que data não pode ser maior que HOJE
- **Arquivo:** `app/elo-da-rota/confraria/completar/[id]/page.tsx`
- **Responsável:** Marina (Frontend)
- **Status:** ⏳ Pendente

#### PROBLEMA #3: Fotos não entram no perfil
- **Sintoma:** Upload de foto feito, mas não aparece no perfil
- **Causa:** A ser investigada
- **Investigar:** 
  - [ ] Upload está salvando no Storage?
  - [ ] URL está sendo salva no banco?
  - [ ] Query do perfil busca as fotos?
- **Responsável:** Carlos (Backend)
- **Status:** ⏳ Pendente

#### PROBLEMA #4: Pontos não creditados
- **Sintoma:** Após completar confraria, pontos não aparecem
- **Causa:** RLS corrigida, mas função pode estar falhando
- **Investigar:**
  - [ ] Logs do console do navegador
  - [ ] Verificar se `awardPoints()` está retornando erro
  - [ ] Verificar tabela `points_history`
- **Responsável:** Rafael (DBA)
- **Status:** ⏳ Pendente

#### PROBLEMA #5: Confraria ainda "agendada" no Veterano
- **Sintoma:** Card de confrarias mostra 27 JAN com badge vermelho
- **Causa:** Status do invite não mudou para 'completed'
- **Investigar:**
  - [ ] Verificar status atual do invite no banco
  - [ ] Função `completeConfraternity()` está atualizando?
- **Responsável:** Carlos (Backend)
- **Status:** ⏳ Pendente

#### PROBLEMA #6: Fotos não entram no feed "Na Rota"
- **Sintoma:** Feed mostra "Nenhuma publicação ainda"
- **Causa:** Post não foi criado ou não está sendo buscado
- **Investigar:**
  - [ ] Tabela `posts` tem registros?
  - [ ] Query do feed está filtrando corretamente?
- **Responsável:** Marina (Frontend)
- **Status:** ⏳ Pendente

#### PROBLEMA #7: Histórico sem registros
- **Sintoma:** Histórico de Batalha não mostra atividade de confraria
- **Causa:** Pontos não registrados em `points_history`
- **Dependência:** Resolver #4 primeiro
- **Status:** ⏳ Pendente

---

### 🟡 PRIORIDADE MÉDIA (UX)

#### PROBLEMA #1: Visual da tela "Confirmar Realização"
- **Sintoma:** Tela básica, sem design premium
- **Solução:** Aplicar padrões visuais da plataforma
- **Responsável:** Lucas (UX)
- **Status:** ⏳ Pendente

#### PROBLEMA #8: Visual do Dashboard "Rota do Valente"
- **Sintoma:** Pode ser melhorado
- **Solução:** Revisar layout e animações
- **Responsável:** Lucas (UX)
- **Status:** ⏳ Pendente

---

## 🔍 INVESTIGAÇÃO INICIAL

### Verificar no Banco de Dados:

```sql
-- 1. Status do convite de confraria
SELECT id, status, sender_id, receiver_id, proposed_date 
FROM confraternity_invites 
WHERE status IN ('accepted', 'pending_partner', 'completed')
ORDER BY created_at DESC LIMIT 5;

-- 2. Tabela confraternities (realização)
SELECT * FROM confraternities ORDER BY created_at DESC LIMIT 5;

-- 3. Pontos recentes
SELECT * FROM points_history ORDER BY created_at DESC LIMIT 10;

-- 4. Posts criados
SELECT id, user_id, content, confraternity_id, created_at 
FROM posts ORDER BY created_at DESC LIMIT 5;
```

---

## 📌 ORDEM DE EXECUÇÃO

1. **[AGORA]** Investigar banco de dados para entender estado atual
2. **[DEPOIS]** Corrigir Problema #4 (Pontos)
3. **[DEPOIS]** Corrigir Problema #5 (Status da Confraria)
4. **[DEPOIS]** Corrigir Problema #3 e #6 (Fotos/Feed)
5. **[DEPOIS]** Corrigir Problema #2 (Validação de Data)
6. **[DEPOIS]** Melhorar Visual #1 e #8

---

## ✅ CRITÉRIOS DE SUCESSO

- [ ] Ao completar confraria: pontos aparecem no histórico imediatamente
- [ ] Ao completar confraria: status muda para 'completed' ou 'pending_partner'
- [ ] Ao completar confraria: fotos aparecem no feed "Na Rota"
- [ ] Validação impede data futura
- [ ] Veterano vê confraria como "realizada", não "agendada"
- [ ] Ambos participantes recebem pontos

---

**Próximo passo:** Investigar banco de dados
