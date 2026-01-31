# ✅ PLANO DE TESTES - MÓDULO DE PROJETOS

> **Data do Teste:** 31/01/2026  
> **Responsável:** Igor  
> **Ambiente:** Development (localhost:3000)  
> **Duração Estimada:** 1-2 horas

---

## 🎯 OBJETIVO

Testar o **fluxo completo end-to-end** do Módulo de Projetos, desde a criação até a aceitação de proposta, validando todas as integrações e regras de negócio.

---

## 📋 PRÉ-REQUISITOS

### 1. Ambiente Dev Rodando
```bash
cd /home/igor/Vídeos/Legendarios
npm run dev
```
✅ Confirmar que está rodando em `http://localhost:3000`

### 2. Banco de Dados
```bash
# Verificar se migration foi executada
psql -h db.xxx.supabase.co -U postgres -d postgres

# Listar tabelas
\dt

# Deve mostrar:
# - projects
# - project_proposals
# - project_notifications
# - project_activities
# - project_messages
# - project_reviews
# - project_penalties
# - project_distribution_log
```

### 3. Usuários de Teste

**Cliente (sem cadastro):**
- Nome: João Silva Teste
- Email: teste.cliente@rotabusiness.com
- Telefone: (11) 99999-9999

**Profissional 1 (cadastrado):**
- Login na plataforma
- Categoria: Desenvolvimento Mobile
- VIGOR: 2500+ (Grupo 1)

**Profissional 2 (cadastrado):**
- Login na plataforma
- Categoria: Desenvolvimento Mobile
- VIGOR: 1500-2499 (Grupo 2)

**Profissional 3 (cadastrado):**
- Login na plataforma  
- Categoria: Desenvolvimento Mobile
- VIGOR: <1500 (Grupo 3)

---

## 🧪 TESTES A EXECUTAR

---

### ✅ TESTE 1: Criar Projeto (Cliente SEM Login)

**Objetivo:** Validar criação de projeto por visitante

**Passos:**

1. **Abrir navegador anônimo/privado** (Ctrl+Shift+N)
   
2. **Acessar URL:**
   ```
   http://localhost:3000/projects/create
   ```

3. **Preencher formulário:**
   - **Nome:** João Silva Teste
   - **Email:** teste.cliente@rotabusiness.com
   - **Telefone:** (11) 99999-9999
   - **Título:** App de Delivery de Comida
   - **Categoria:** Desenvolvimento > Mobile
   - **Orçamento:** R$ 15.000
   - **Prazo:** 60 dias
   - **Descrição:**
     ```
     Preciso de um aplicativo mobile (iOS e Android) para delivery de comida com:
     - Cadastro de restaurantes
     - Cardápio digital
     - Carrinho de compras
     - Integração com pagamento
     - Rastreamento em tempo real
     - Push notifications
     ```

4. **Clicar em "Lançar Projeto Agora"**

**✅ Resultado Esperado:**
- Mensagem de sucesso exibida
- "Projeto Lançado! Seu projeto foi publicado..."
- Botão "Voltar ao Dashboard"

**📊 Validações Backend:**
```sql
-- 1. Verificar projeto criado
SELECT id, title, status, current_group, tracking_token, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 1;

-- Deve mostrar:
-- status = 'pending'
-- current_group = 1
-- tracking_token não nulo

-- 2. Verificar log de distribuição
SELECT * FROM project_distribution_log
ORDER BY created_at DESC
LIMIT 1;

-- Deve mostrar:
-- group_number = 1
-- professionals_notified > 0

-- 3. Verificar notificações criadas
SELECT COUNT(*) FROM project_notifications
WHERE project_id = (SELECT id FROM projects ORDER BY created_at DESC LIMIT 1);

-- Deve mostrar: COUNT > 0 (profissionais do Grupo 1)
```

**📝 Anotar:**
- ✅ Projeto ID: _______________________
- ✅ Tracking Token: _______________________
- ✅ Qtd Notificados: _______

---

### ✅ TESTE 2: Verificar Notificações (Profissional Grupo 1)

**Objetivo:** Validar que profissional foi notificado

**Passos:**

1. **Fazer logout** (se estiver logado)

2. **Login como Profissional 1** (Grupo 1 - VIGOR alto)
   ```
   http://localhost:3000/login
   ```

3. **Acessar Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

4. **Verificar sidebar direita:**
   - Card "MEUS PROJETOS"
   - Badge com número (ex: "3" projetos novos)
   - Badge deve estar animado/pulsando

5. **Hover no card:**
   - Deve mostrar "Ver Projetos Disponíveis"

6. **Verificar sino no header:**
   - Deve ter badge de notificação

7. **Verificar mensagens do admin:**
   - Deve ter mensagem sobre novo projeto

**✅ Resultado Esperado:**
- Badge de notificação visível
- Contador mostrando projetos novos
- Notificação em pelo menos 1 dos 3 canais

**📊 Validação SQL:**
```sql
-- Verificar notificação do profissional logado
SELECT * FROM project_notifications
WHERE professional_id = 'UUID_DO_PROFISSIONAL_LOGADO'
  AND viewed = false
ORDER BY created_at DESC;

-- Deve mostrar a notificação do projeto criado
```

**📝 Anotar:**
- ✅ Badge aparecendo? SIM / NÃO
- ✅ Contador correto? _______
- ✅ Tipo de notificação: _______

---

### ✅ TESTE 3: Enviar Proposta (Profissional 1)

**Objetivo:** Profissional envia proposta com orçamento

**Passos:**

1. **Ainda logado como Profissional 1**

2. **Clicar no card "MEUS PROJETOS"** ou acessar:
   ```
   http://localhost:3000/dashboard/projects
   ```
   (Se página não existir, pular para teste via API)

3. **Ver lista de projetos disponíveis:**
   - Deve mostrar "App de Delivery de Comida"
   - Status: Disponível
   - Badge: "NOVO"

4. **Clicar em "Enviar Proposta"**
   - Modal deve abrir

5. **Preencher proposta:**
   - **Orçamento:** R$ 12.500,00
   - **Prazo:** 45 dias
   - **Descrição:**
     ```
     Olá! Tenho 5 anos de experiência em desenvolvimento mobile.
     
     Já desenvolvi 3 apps similares de delivery:
     - FoodFast (2023) - 10k downloads
     - QuickEats (2024) - 5k downloads
     - MealNow (2025) - em produção
     
     Proposta de entrega:
     - Protótipo figma: 7 dias
     - MVP (iOS e Android): 30 dias
     - App completo: 45 dias
     - Suporte pós-lançamento: 3 meses grátis
     
     Tecnologias: React Native, Node.js, PostgreSQL, Firebase
     ```

6. **Clicar em "Enviar Proposta"**

**✅ Resultado Esperado:**
- Mensagem: "✅ Proposta enviada com sucesso! O cliente será notificado."
- Modal fecha
- Projeto muda status ou mostra "Proposta Enviada"

**📊 Validação SQL:**
```sql
-- Verificar proposta criada
SELECT * FROM project_proposals
WHERE project_id = 'UUID_DO_PROJETO'
  AND professional_id = 'UUID_DO_PROFISSIONAL_1'
ORDER BY created_at DESC
LIMIT 1;

-- Deve mostrar:
-- proposed_budget = 12500
-- estimated_days = 45
-- status = 'pending'

-- Verificar status do projeto
SELECT status FROM projects WHERE id = 'UUID_DO_PROJETO';

-- Deve mostrar:
-- status = 'receiving_proposals'
```

**🔧 ALTERNATIVA - Testar via API (se interface não funcionar):**
```bash
# 1. Pegar token de autenticação
# Abrir DevTools > Application > Cookies > sb-access-token

# 2. Enviar proposta via curl
curl -X POST http://localhost:3000/api/projects/UUID_DO_PROJETO/submit-proposal \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=SEU_TOKEN_AQUI" \
  -d '{
    "proposed_budget": 12500,
    "estimated_days": 45,
    "description": "Tenho 5 anos de experiência..."
  }'

# Deve retornar: {"success":true, "proposalId":"..."}
```

**📝 Anotar:**
- ✅ Proposta enviada? SIM / NÃO
- ✅ Proposta ID: _______________________
- ✅ Método usado: Interface / API

---

### ✅ TESTE 4: Enviar Mais Propostas (Profissionais 2 e 3)

**Objetivo:** Criar competição com múltiplas propostas

**Repetir TESTE 3 com:**

**Profissional 2 (Grupo 1 ou 2):**
- Orçamento: R$ 9.000,00 (MENOR PREÇO)
- Prazo: 60 dias
- Descrição: Simples mas enfatizando custo-benefício

**Profissional 3 (Grupo 2 ou 3):**
- Orçamento: R$ 14.000,00
- Prazo: 30 dias (MAIS RÁPIDO)
- Descrição: Enfatizando velocidade

**📝 Anotar:**
- ✅ Proposta 2 enviada? SIM / NÃO
- ✅ Proposta 3 enviada? SIM / NÃO

---

### ✅ TESTE 5: Visualizar Propostas (Cliente)

**Objetivo:** Cliente vê e compara propostas

**Passos:**

1. **Abrir navegador anônimo** (mesmo do TESTE 1)

2. **Buscar tracking_token do projeto:**
   ```sql
   SELECT tracking_token FROM projects
   WHERE title LIKE '%Delivery%'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Acessar URL com token:**
   ```
   http://localhost:3000/projects/view/UUID_DO_PROJETO?token=TRACKING_TOKEN
   ```
   
   Exemplo:
   ```
   http://localhost:3000/projects/view/abc-123/proposals?token=xyz-789
   ```

4. **Verificar página:**
   - **Header:** Título "App de Delivery de Comida"
   - **Info:** Categoria, orçamento, prazo
   - **Propostas:** 3 cards visíveis

5. **Verificar Badges Automáticos:**
   - ✅ Badge "🔥 PROFISSIONAL TOP" no profissional com maior VIGOR
   - ✅ Badge "💰 MENOR PREÇO" na proposta de R$ 9.000
   - ✅ Badge "⚡ MAIS RÁPIDO" na proposta de 30 dias

6. **Testar Ordenação:**
   - Clicar em dropdown "Ordenar por"
   - Selecionar "Menor Preço"
   - Proposta de R$ 9.000 deve aparecer primeiro
   
   - Selecionar "Menor Prazo"
   - Proposta de 30 dias deve aparecer primeiro
   
   - Selecionar "Melhor Avaliado"
   - Profissional com maior VIGOR primeiro

7. **Verificar dados de cada card:**
   - Avatar do profissional
   - Nome completo
   - Patente (CAPITÃO, MAJOR, etc)
   - Pontos VIGOR
   - Projetos concluídos
   - Orçamento proposto
   - Prazo estimado
   - Descrição completa
   - Botão "Ver Perfil Completo"
   - Botão "ACEITAR PROPOSTA"

**✅ Resultado Esperado:**
- Página carrega sem erros
- 3 cards de propostas visíveis
- Badges corretos em cada proposta
- Ordenação funciona
- Design com cores Rota Business (verde/laranja)

**📝 Anotar:**
- ✅ Página carregou? SIM / NÃO
- ✅ Propostas visíveis: ___ de 3
- ✅ Badges corretos? SIM / NÃO
- ✅ Ordenação funciona? SIM / NÃO

---

### ✅ TESTE 6: Aceitar Proposta (Cliente)

**Objetivo:** Cliente escolhe melhor proposta

**Passos:**

1. **Na mesma página do TESTE 5**

2. **Decidir qual proposta aceitar** (sugestão: a de menor preço - R$ 9.000)

3. **Clicar em "ACEITAR PROPOSTA"**

4. **Modal de confirmação abre:**
   - Título: "Confirmar Aceitação da Proposta"
   - Texto: Nome do profissional + valor
   - Aviso: "Esta ação não pode ser desfeita..."
   - Botões: "Cancelar" e "Sim, Aceitar Proposta"

5. **Clicar em "Sim, Aceitar Proposta"**

6. **Aguardar processamento**

**✅ Resultado Esperado:**
- Loading/spinner aparece
- Mensagem de sucesso (alert ou toast)
- Página atualiza
- Proposta aceita mostra badge "✅ PROPOSTA ACEITA"
- Outras propostas mostram "Proposta não selecionada"

**📊 Validação SQL:**
```sql
-- 1. Verificar proposta aceita
SELECT id, status, proposed_budget
FROM project_proposals
WHERE project_id = 'UUID_DO_PROJETO'
ORDER BY 
  CASE WHEN status = 'accepted' THEN 0 ELSE 1 END,
  created_at;

-- Deve mostrar:
-- 1 proposta com status = 'accepted'
-- 2 propostas com status = 'rejected'

-- 2. Verificar projeto
SELECT status, accepted_by, final_budget, accepted_at
FROM projects
WHERE id = 'UUID_DO_PROJETO';

-- Deve mostrar:
-- status = 'accepted'
-- accepted_by = UUID do profissional escolhido
-- final_budget = 9000 (valor da proposta aceita)
-- accepted_at não nulo

-- 3. Verificar atividade registrada
SELECT * FROM project_activities
WHERE project_id = 'UUID_DO_PROJETO'
  AND action = 'proposal_accepted'
ORDER BY created_at DESC
LIMIT 1;

-- Deve existir registro
```

**📝 Anotar:**
- ✅ Modal abriu? SIM / NÃO
- ✅ Aceitação funcionou? SIM / NÃO
- ✅ Status correto no banco? SIM / NÃO
- ✅ Profissional aceito: _______________________

---

### ✅ TESTE 7: Verificar Notificação (Profissional Aceito)

**Objetivo:** Profissional sabe que foi escolhido

**Passos:**

1. **Fazer login como Profissional que foi aceito** (do TESTE 6)

2. **Verificar notificações:**
   - Sino no header com badge
   - Mensagem do admin
   - Card de projetos atualizado

3. **Acessar "Meus Projetos"**
   - Projeto deve aparecer em "Projetos Aceitos" ou "Em Andamento"
   - Status: "Em execução"

**✅ Resultado Esperado:**
- Notificação de aceitação recebida
- Projeto visível em "aceitos"

**📊 Validação SQL:**
```sql
-- Verificar notificação criada
SELECT * FROM project_notifications
WHERE professional_id = 'UUID_PROFISSIONAL_ACEITO'
  AND type = 'proposal_accepted'
ORDER BY created_at DESC
LIMIT 1;

-- Deve existir
```

**📝 Anotar:**
- ✅ Notificação recebida? SIM / NÃO
- ✅ Projeto em "aceitos"? SIM / NÃO

---

### ✅ TESTE 8: Verificar Notificação (Profissionais Rejeitados)

**Objetivo:** Profissionais sabem que não foram escolhidos

**Passos:**

1. **Login como Profissional 2 ou 3** (que foi rejeitado)

2. **Verificar notificações:**
   - Deve ter notificação educada de rejeição

**✅ Resultado Esperado:**
- Notificação de rejeição recebida
- Mensagem não agressiva

**📝 Anotar:**
- ✅ Notificação recebida? SIM / NÃO

---

### ✅ TESTE 9: Contador em Tempo Real

**Objetivo:** Validar subscrição Realtime

**Passos:**

1. **Abrir 2 navegadores:**
   - Navegador A: Cliente criando projeto
   - Navegador B: Profissional no dashboard

2. **Navegador A:** Criar novo projeto (TESTE 1)

3. **Navegador B:** Observar card "MEUS PROJETOS"
   - Contador deve atualizar AUTOMATICAMENTE
   - Badge deve aparecer/aumentar
   - SEM refresh manual

**✅ Resultado Esperado:**
- Atualização instantânea
- Sem necessidade de F5

**📝 Anotar:**
- ✅ Tempo real funciona? SIM / NÃO
- ✅ Delay observado: ____ segundos

---

### ✅ TESTE 10: CRON Job (Manual)

**Objetivo:** Validar distribuição para Grupo 2

**⚠️ TESTE MANUAL (CRON roda a cada 24h em produção)**

**Passos:**

1. **Criar projeto e aguardar** (ou simular modificando banco):
   ```sql
   -- Modificar projeto para simular 24h passadas
   UPDATE projects
   SET group1_notified_at = now() - interval '25 hours'
   WHERE id = 'UUID_PROJETO_TESTE';
   ```

2. **Chamar CRON manualmente:**
   ```bash
   curl -X GET http://localhost:3000/api/cron/distribute-projects \
     -H "Authorization: Bearer SEU_CRON_SECRET"
   ```

3. **Verificar resposta:**
   ```json
   {
     "success": true,
     "results": {
       "group2Processed": 1,
       ...
     }
   }
   ```

**📊 Validação SQL:**
```sql
-- Verificar projeto movido para Grupo 2
SELECT current_group, group2_notified_at
FROM projects
WHERE id = 'UUID_PROJETO_TESTE';

-- Deve mostrar:
-- current_group = 2
-- group2_notified_at não nulo

-- Verificar novas notificações
SELECT COUNT(*) FROM project_notifications
WHERE project_id = 'UUID_PROJETO_TESTE'
  AND group_number = 2;

-- Deve ter COUNT > 0
```

**📝 Anotar:**
- ✅ CRON executou? SIM / NÃO
- ✅ Grupo 2 notificado? SIM / NÃO

---

## 📊 CHECKLIST FINAL

Após todos os testes, preencher:

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Criar projeto (sem login) | ⬜ OK / ⬜ FALHOU | |
| Notificar Grupo 1 | ⬜ OK / ⬜ FALHOU | |
| Badge/Contador tempo real | ⬜ OK / ⬜ FALHOU | |
| Enviar proposta | ⬜ OK / ⬜ FALHOU | |
| Visualizar propostas | ⬜ OK / ⬜ FALHOU | |
| Badges automáticos | ⬜ OK / ⬜ FALHOU | |
| Ordenação | ⬜ OK / ⬜ FALHOU | |
| Aceitar proposta | ⬜ OK / ⬜ FALHOU | |
| Rejeitar outras (auto) | ⬜ OK / ⬜ FALHOU | |
| Notificar aceito | ⬜ OK / ⬜ FALHOU | |
| Notificar rejeitados | ⬜ OK / ⬜ FALHOU | |
| CRON distribuição | ⬜ OK / ⬜ FALHOU | |
| Design Rota Business | ⬜ OK / ⬜ FALHOU | |

---

## 🐛 RELATÓRIO DE BUGS

Se encontrar bugs, anotar:

### Bug #1
- **Onde:** _______________________
- **O que aconteceu:** _______________________
- **Esperado:** _______________________
- **Console errors:** _______________________

### Bug #2
...

---

## ✅ PRÓXIMOS PASSOS

Após testes:

1. [ ] Corrigir bugs encontrados
2. [ ] Instalar componentes shadcn faltantes
3. [ ] Implementar upload de arquivos real
4. [ ] Integrar email real (SendGrid/Resend)
5. [ ] Testes de performance
6. [ ] Deploy em staging
7. [ ] Testes com usuários reais

---

## 📞 SUPORTE

Dúvidas durante testes:
- Consultar: `/docs/PROJETOS_DOCUMENTACAO_TECNICA.md`
- Ou: `/docs/PROJETOS_APRESENTACAO_NEGOCIO.md`

**Boa sorte nos testes! 🚀**
