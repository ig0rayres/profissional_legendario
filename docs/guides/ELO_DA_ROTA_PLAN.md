# 🤝 ELO DA ROTA - Plano de Implementação
**Sistema de Networking e Conexões**

---

## 🎯 Visão Geral

Sistema social military-themed focado em networking profissional através de reuniões presenciais (Confraternizações).

### Conceitos-Chave

- **Elo:** Conexão entre dois membros
- **Confraria:** Reunião presencial de networking  
- **Mensagens de Irmandade:** Sistema de mensagens privadas
- **Feed da Rota:** Timeline social com atualizações
- **Vigor:** Sistema de apoio/engajamento entre membros
- **Pontos de Vigor:** Métrica de networking ativo

---

## 📋 ESCOPO DETALHADO

### Feature 1: CONFRARIA (Prioridade MÁXIMA)

Sistema de agendamento e registro de reuniões presenciais.

**Limitações por Plano:**
- Recruta: 0 convites/mês
- Veterano: 2 convites/mês
- Elite: 10 convites/mês

**Gamificação:**
- Enviar convite: +10 XP
- Aceitar: +10 XP
- Realizar: +50 XP (cada)
- Foto: +20 XP
- Depoimento: +15 XP

---

## 🗄️ DATABASE SCHEMA

```sql
-- 1. Convites de Confraria
CREATE TABLE confraternity_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status text NOT NULL, -- 'pending', 'accepted', 'rejected', 'completed'
    proposed_date timestamp with time zone,
    location text,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    completed_at timestamp with time zone
);

-- 2. Confraternizações Realizadas
CREATE TABLE confraternities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id uuid REFERENCES confraternity_invites(id),
    member1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    member2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    date_occurred timestamp with time zone NOT NULL,
    location text,
    description text,
    photos jsonb,
    testimonial_member1 text,
    testimonial_member2 text,
    vigor_points integer DEFAULT 0,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Controle de Limites
CREATE TABLE confraternity_limits (
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    month_year text NOT NULL,
    invites_sent integer DEFAULT 0,
    last_reset_at timestamp with time zone DEFAULT now()
);

-- 4. Conexões (Elos)
CREATE TABLE connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    UNIQUE(requester_id, receiver_id)
);

-- 5. Mensagens
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    attachments jsonb,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_confraternity_invites_sender ON confraternity_invites(sender_id);
CREATE INDEX idx_confraternity_invites_receiver ON confraternity_invites(receiver_id);
CREATE INDEX idx_confraternities_members ON confraternities(member1_id, member2_id);
CREATE INDEX idx_connections_users ON connections(requester_id, receiver_id);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);
```

---

## 📱 PRIORIZAÇÃO - 3 FASES

### **FASE 1 - Confraria MVP** (2 semanas)
1. Schema BD
2. API (enviar, aceitar, recusar)
3. Sistema limites por plano
4. Form solicitação
5. Lista pendentes
6. Marcar realizada
7. Upload fotos
8. Gamificação

### **FASE 2 - Elos** (1 semana)
1. Sistema conexões
2. Solicitar/aceitar
3. Lista elos

### **FASE 3 - Social** (2 semanas)
1. Mensagens
2. Feed
3. Vigor

---

**Aprovado para iniciar?**
