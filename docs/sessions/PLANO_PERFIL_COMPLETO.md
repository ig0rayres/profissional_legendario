# 🎯 PLANO COMPLETO - PERFIL DE USUÁRIO
**Data:** 17/01/2026  
**Objetivo:** Implementar todas as funcionalidades sociais e de interação do perfil

---

## 📋 FUNCIONALIDADES SOLICITADAS:

### 1. 🤝 **SISTEMA DE ELO (AMIZADE)**
- [ ] Botão "Criar Elo" no perfil
- [ ] Tabela `user_connections` (pending, accepted, rejected)
- [ ] Lógica de envio de convite
- [ ] Lógica de aceite/rejeição
- [ ] Lista de "Meus Elos" (amigos)
- [ ] Feed de atividades dos amigos

**Notificações:**
- Quando alguém te envia Elo → notificação
- Quando alguém aceita seu Elo → notificação

---

### 2. 📢 **SISTEMA DE NOTIFICAÇÕES SOCIAL**
- [ ] Notificações de atividades dos amigos:
  - Nova medalha conquistada
  - Participou de confraria
  - Concluiu serviço/projeto
  - Nova publicação
- [ ] Notificações de confraria:
  - Convite recebido
  - Convite aceito/rejeitado
- [ ] Notificações de Elo:
  - Novo convite de amizade
  - Convite aceito

**Tabelas:**
- `notifications` (já existe?)
- Triggers para auto-criar notificações

---

### 3. 💬 **MENSAGERIA (CHAT)**
- [ ] Botão "Enviar Mensagem" no perfil
- [ ] Tabela `conversations`
- [ ] Tabela `messages`
- [ ] Interface de chat (modal ou página)
- [ ] Notificações de novas mensagens
- [ ] Status: lida/não lida

---

### 4. ⚔️ **CONFRARIA (APRIMORADA)**
- [ ] Botão "Solicitar Confraria" no perfil
- [ ] Fluxo: Solicitar → Agendar → Google Calendar
- [ ] Notificação ao convidado
- [ ] Resposta (aceitar/rejeitar) → notifica solicitante
- [ ] Confraria aceita → evento no mural "Elo da Rota"
- [ ] Upload de foto + descrição da confraria
- [ ] Fotos aparecem no mural "Elo da Rota"

**Módulo já existe:** `confraternities`, `confraternity_invites`  
**A implementar:** Integração com mural público

---

### 5. 🙏 **SISTEMA DE ORAÇÃO**
- [ ] Botão "Orar" no perfil
- [ ] Modal para escrever mensagem breve
- [ ] Tabela `prayer_requests`
- [ ] Mensagens ficam salvas no perfil de quem recebe
- [ ] Lista de orações recebidas
- [ ] Privacidade: só o dono vê? Ou público?

---

### 6. ⭐ **SISTEMA DE CLASSIFICAÇÃO/AVALIAÇÃO**
- [ ] Botão "Classificar" no perfil
- [ ] Modal de rating (1-5 estrelas)
- [ ] Campo de comentário
- [ ] Tabela `ratings` (já existe?)
- [ ] Média de rating no perfil
- [ ] Últimas avaliações visíveis

**Módulo já existe:** `ratings` (verificar estrutura)

---

### 7. 📊 **PROJETOS ENTREGUES**
- [ ] Contador "X projetos entregues"
- [ ] Tabela `projects` ou `services_completed`
- [ ] Lógica de marcar projeto como concluído
- [ ] Stats no perfil

---

### 8. 🆔 **ID ROTA BUSINESS**
- [ ] Campo `rota_number` visível na testeira
- [ ] Badge destacado
- [ ] Campo já existe em `profiles.rota_number`

---

## 🗂️ ESTRUTURA DE DADOS NECESSÁRIA:

### **Novas Tabelas:**

```sql
-- 1. Sistema de Elo (Amizade)
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- 2. Mensageria
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  UNIQUE(participant_1_id, participant_2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sistema de Oração
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projetos/Serviços (se não existir)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Atividades (Feed Social)
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT, -- 'medal', 'confraternity', 'project', 'post'
  activity_data JSONB, -- dados específicos
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO SUGERIDA:

### **FASE 1: BASE DE DADOS** (1h)
1. Criar tabelas SQL
2. RLS policies
3. Verificar módulos existentes (ratings, confraternities)

### **FASE 2: ID ROTA + PROJETOS** (30min)
4. Adicionar `rota_number` na testeira
5. Contador de projetos

### **FASE 3: SISTEMA DE ELO** (2h)
6. Botão "Criar Elo"
7. Gerenciar convites
8. Lista de amigos

### **FASE 4: CLASSIFICAÇÃO** (1h)
9. Botão "Classificar"
10. Modal de rating
11. Integrar com existing `ratings`

### **FASE 5: ORAÇÃO** (1h)
12. Botão "Orar"
13. Sistema de mensagens de oração

### **FASE 6: CONFRARIA APRIMORADA** (2h)
14. Botão "Solicitar Confraria"
15. Integração com mural
16. Upload de fotos

### **FASE 7: MENSAGERIA** (3h)
17. Chat entre usuários
18. Interface de conversas

### **FASE 8: NOTIFICAÇÕES** (2h)
19. Sistema de notificações social
20. Triggers automáticos

### **FASE 9: FEED SOCIAL** (2h)
21. Atividades dos amigos
22. Mural "Elo da Rota" público

---

## ⏰ TEMPO ESTIMADO TOTAL: **14-16 horas**

---

## 🎯 PRIORIDADES:

### **ALTA (Fazer Agora):**
1. ✅ ID Rota visível
2. ✅ Contador de projetos
3. ✅ Sistema de Elo (Amizade)
4. ✅ Classificação/Rating
5. ✅ Botão Confraria

### **MÉDIA (Fazer Depois):**
6. Sistema de Oração
7. Feed de atividades
8. Notificações sociais

### **BAIXA (Última):**
9. Mensageria (Chat)

---

## 📝 DECISÕES IMPORTANTES:

### **Sistema de Oração:**
- [ ] Privado (só o dono vê)?
- [ ] Semi-público (amigos veem)?
- [ ] Público?

### **Sistema de Elo:**
- [ ] Bilateral (ambos precisam aceitar)?
- [ ] Unilateral (seguir sem reciprocidade)?

### **Projetos:**
- [ ] Usar tabela existente?
- [ ] Criar nova?
- [ ] Integrar com marketplace?

---

## 🔄 PRÓXIMO PASSO:

**Escolha por onde começar:**
- A) FASE 1 - Criar estrutura de dados completa
- B) Implementar funcionalidades uma a uma
- C) Priorizar o que é mais importante

**Qual caminho?** 🚀
