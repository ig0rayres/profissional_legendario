# 👤 PERFIL DE USUÁRIO - ESPECIFICAÇÃO COMPLETA
## Regras de Negócio e Funcionalidades

---

## 🎯 VISÃO GERAL DO PERFIL

O perfil é a **central de interação social** da plataforma. Cada usuário possui um perfil público acessível por:
- URL amigável: `/professional/{slug}` (ex: `/professional/erick-cabral`)
- URL direta: `/professional/{uuid}`

---

## 📊 SEÇÕES DO PERFIL

### 1. **TESTEIRA (HEADER)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Avatar]    NOME COMPLETO                                      │
│  ⬛ Badge    📍 Localização                                      │
│  Plano      🆔 ID ROTA: RB-00123 (visível e destacado)         │
│                                                                 │
│  Bio do usuário aqui...                                         │
│                                                                 │
│  [Tag 1] [Tag 2] [Tag 3] [Tag 4] (especialidades)              │
└─────────────────────────────────────────────────────────────────┘
```

**Elementos:**
- ✅ Avatar (foto ou inicial)
- ✅ Nome completo
- ✅ Badge de verificação (se verificado)
- ✅ Badge do plano (Recruta/Veterano/Elite)
- ✅ **ID ROTA BUSINESS** (destaque visual - campo `rota_number`)
- ✅ Localização (cidade/estado)
- ✅ Bio do usuário
- ✅ Tags de especialidades

---

### 2. **BARRA DE AÇÕES (BOTÕES)**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [🤝 Criar Elo] [💬 Mensagem] [⚔️ Confraria] [🙏 Orar] [⭐ Classificar]       │
│  [💼 Solicitar Projeto]                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Botão | Função | Regras |
|-------|--------|--------|
| 🤝 **Criar Elo** | Enviar convite de amizade | Respeita limite do plano |
| 💬 **Mensagem** | Abrir chat privado | Todos podem enviar |
| ⚔️ **Confraria** | Solicitar confraria | RECRUTA: só recebe. VET: 4/mês. ELITE: 10/mês |
| 🙏 **Orar** | Enviar mensagem de oração | Todos podem enviar |
| ⭐ **Classificar** | Avaliar usuário (1-5 estrelas) | Apenas logados |
| 💼 **Solicitar Projeto** | Enviar demanda de projeto direto ao usuário | Apenas logados |

---

### 2.1 **MODAL: SOLICITAR PROJETO**

Segue o mesmo padrão da página "Lançar Projeto". Campos:

```
┌─────────────────────────────────────────────────────────────────┐
│  💼 SOLICITAR PROJETO                                            │
│                                                                 │
│  Para: [Nome do Profissional] ✅                                │
│                                                                 │
│  Título do Projeto *                                            │
│  [___________________________________________________]         │
│                                                                 │
│  Descrição detalhada *                                          │
│  [___________________________________________________]         │
│  [___________________________________________________]         │
│  [___________________________________________________]         │
│                                                                 │
│  Categoria *                                                    │
│  [▼ Selecione a categoria do serviço]                          │
│                                                                 │
│  Orçamento estimado                                             │
│  [▼ Faixa de valor] (Até R$500 / R$500-2k / R$2k-5k / +R$5k)   │
│                                                                 │
│  Prazo desejado                                                 │
│  [📅 Selecione data]                                            │
│                                                                 │
│  Anexos (opcional)                                              │
│  [📎 Adicionar arquivos]                                        │
│                                                                 │
│              [Cancelar]  [Enviar Solicitação]                  │
└─────────────────────────────────────────────────────────────────┘
```

**Regras de negócio:**
- Apenas usuários logados podem solicitar
- Profissional recebe notificação
- Solicitação fica em "Propostas Recebidas" do profissional
- Profissional pode Aceitar/Recusar/Responder com valor
- Histórico de solicitações fica salvo

---

### 3. **CARD DE GAMIFICAÇÃO**

```
┌─────────────────────────────────────────────────────────────────┐
│  🏆 GAMIFICAÇÃO                                                  │
│                                                                 │
│  [Ícone Patente]  PATENTE: GENERAL                             │
│                   Nível 5 • Multiplicador x2.0                  │
│                                                                 │
│  ▰▰▰▰▰▰▰▰▰▱ 85%                                                 │
│  2.800 / 3.500 vigor para LENDA                                │
│                                                                 │
│  🔥 VIGOR TOTAL: 2.800                                          │
│  🏅 MEDALHAS: 7/16                                              │
│  ⭐ PLANO: Elite (x2.0 XP)                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Dados:**
- Patente atual (ícone + nome do banco `ranks`)
- Nível e multiplicador
- Barra de progresso para próxima patente
- Vigor total
- Contador de medalhas
- Plano e bônus de XP

---

### 4. **GRID DE MEDALHAS**

```
┌─────────────────────────────────────────────────────────────────┐
│  🏅 MEDALHAS CONQUISTADAS (7/16)                                │
│  ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ 44%                                          │
│                                                                 │
│  [🏆]  [🏆]  [🏆]  [🔒]                                          │
│  [🏆]  [🏆]  [🔒]  [🔒]                                          │
│  [🏆]  [🏆]  [🔒]  [🔒]                                          │
│  [🔒]  [🔒]  [🔒]  [🔒]                                          │
│                                                                 │
│  (Hover: nome, descrição, pontos, data conquista)              │
└─────────────────────────────────────────────────────────────────┘
```

**Regras:**
- Ícones vem do banco `medals.icon`
- Conquistadas: coloridas, clicáveis
- Bloqueadas: grayscale, cadeado
- Tooltip com detalhes

---

### 5. **ESTATÍSTICAS DE CONFRARIA**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚔️ CONFRARIAS                                                   │
│                                                                 │
│  📊 5 Criadas    👥 12 Participou    📸 23 Fotos               │
│                                                                 │
│  📅 Próximo Evento:                                             │
│     Churrasco da Vitória                                        │
│     25/01/2026 às 19:00                                         │
│                                                                 │
│  [Ver Galeria]  [Criar Evento]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. **PROJETOS ENTREGUES**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 PROJETOS                                                     │
│                                                                 │
│  ✅ 15 Projetos Entregues                                        │
│  🔄 2 Em andamento                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 7. **AVALIAÇÕES/CLASSIFICAÇÕES**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⭐ AVALIAÇÕES                           Média: 4.8 ⭐⭐⭐⭐⭐    │
│                                          (45 avaliações)        │
│                                                                 │
│  [Avatar] João Silva           ⭐⭐⭐⭐⭐                        │
│           "Excelente profissional!"                             │
│           há 2 dias                                             │
│                                                                 │
│  [Avatar] Maria Santos         ⭐⭐⭐⭐⭐                        │
│           "Recomendo muito!"                                    │
│           há 5 dias                                             │
│                                                                 │
│  [Ver todas]                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8. **ORAÇÕES RECEBIDAS** (visível só para o dono)

```
┌─────────────────────────────────────────────────────────────────┐
│  🙏 ORAÇÕES RECEBIDAS (12)                                       │
│                                                                 │
│  [Avatar] Carlos - "Orando pela sua família!" - há 1h          │
│  [Avatar] Pedro - "Que Deus te abençoe!" - há 3h               │
│  [Avatar] Ana - "Força na jornada!" - há 1 dia                  │
│                                                                 │
│  [Ver todas]                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 9. **PORTFÓLIO** (se houver itens)

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 PORTFÓLIO                                                    │
│                                                                 │
│  [Imagem 1]   [Imagem 2]   [Imagem 3]   [Imagem 4]             │
│  Título       Título        Título       Título                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10. **INFORMAÇÕES DE CONTATO**

```
┌─────────────────────────────────────────────────────────────────┐
│  📞 CONTATO                                                      │
│                                                                 │
│  📧 email@exemplo.com                                           │
│  📱 (16) 99999-9999 (se preenchido)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 REGRAS DE NEGÓCIO POR PLANO

### **RECRUTA** (Plano Gratuito)
| Funcionalidade | Limite |
|----------------|--------|
| Criar Confraria | ❌ 0 (só recebe convites) |
| Responder Confraria | ✅ Sim |
| Elos (Amigos) | ✅ 10 máximo |
| Anúncios Marketplace | ❌ 0 |
| Enviar Mensagens | ✅ Sim |
| Enviar Orações | ✅ Sim |
| Classificar | ✅ Sim |
| Multiplicador XP | x1.0 |

### **VETERANO**
| Funcionalidade | Limite |
|----------------|--------|
| Criar Confraria | ✅ 4/mês |
| Responder Confraria | ✅ Sim |
| Elos (Amigos) | ✅ 100 máximo |
| Anúncios Marketplace | ✅ 2 simultâneos |
| Enviar Mensagens | ✅ Sim |
| Enviar Orações | ✅ Sim |
| Classificar | ✅ Sim |
| Multiplicador XP | x1.5 |

### **ELITE**
| Funcionalidade | Limite |
|----------------|--------|
| Criar Confraria | ✅ 10/mês |
| Responder Confraria | ✅ Sim |
| Elos (Amigos) | ✅ Ilimitado |
| Anúncios Marketplace | ✅ 10 simultâneos |
| Enviar Mensagens | ✅ Sim |
| Enviar Orações | ✅ Sim |
| Classificar | ✅ Sim |
| Multiplicador XP | x3.0 |

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### **Notificações geradas automaticamente:**

| Evento | Notifica |
|--------|----------|
| Novo convite de Elo | Destinatário |
| Elo aceito | Solicitante |
| Novo convite de Confraria | Destinatário |
| Confraria aceita | Solicitante |
| Confraria rejeitada | Solicitante |
| Nova mensagem | Destinatário |
| Nova oração recebida | Destinatário |
| Nova classificação/avaliação | Perfil avaliado |
| Medalha conquistada | Amigos (Elos) |
| Participou de Confraria | Amigos (Elos) |
| Projeto concluído | Amigos (Elos) |
| Subiu de patente | Amigos (Elos) |

---

## 🌐 INTEGRAÇÃO COM ELO DA ROTA (MURAL PÚBLICO)

### **Eventos que aparecem no mural:**

1. ✅ Confraria aceita (ambas as partes confirmaram)
2. ✅ Fotos de confrarias realizadas
3. ✅ Medalhas conquistadas
4. ✅ Novas patentes alcançadas

### **Fluxo da Confraria:**
```
1. Usuário A solicita confraria → Notifica B
2. B aceita convite → Notifica A + Agenda Google Calendar
3. Evento acontece → Ambos podem subir foto + descrição
4. Foto aparece no mural "Elo da Rota"
```

---

## 📱 COMPONENTES A IMPLEMENTAR

| Componente | Arquivo | Status |
|------------|---------|--------|
| ProfileHeader | `profile-header.tsx` | ✅ Existe |
| GamificationCard | `gamification-card.tsx` | ✅ Existe |
| MedalsGrid | `medals-grid.tsx` | ✅ Existe |
| ConfraternityStats | `confraternity-stats.tsx` | ✅ Existe |
| ActionButtons | `profile-action-buttons.tsx` | ⏳ Criar |
| ProjectsCounter | `projects-counter.tsx` | ⏳ Criar |
| RatingsSection | `ratings-section.tsx` | ⏳ Criar |
| PrayersSection | `prayers-section.tsx` | ⏳ Criar |
| ConnectionButton | `connection-button.tsx` | ⏳ Criar |
| MessageButton | `message-button.tsx` | ⏳ Criar |
| ConfraternityButton | `confraternity-button.tsx` | ⏳ Criar |
| PrayerButton | `prayer-button.tsx` | ⏳ Criar |
| RatingButton | `rating-button.tsx` | ⏳ Criar |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Banco de Dados**
- [ ] Executar `DEPLOY_SISTEMA_SOCIAL.sql`
- [ ] Verificar tabelas criadas
- [ ] Testar functions de limites

### **FASE 2: Componentes de Ação**
- [ ] Criar `ConnectionButton` (Criar Elo)
- [ ] Criar `MessageButton` (Enviar Mensagem)
- [ ] Criar `ConfraternityButton` (Solicitar Confraria)
- [ ] Criar `PrayerButton` (Orar)
- [ ] Criar `RatingButton` (Classificar)

### **FASE 3: Seções do Perfil**
- [ ] Adicionar ID Rota no header
- [ ] Criar contador de projetos
- [ ] Criar seção de orações recebidas
- [ ] Melhorar seção de avaliações

### **FASE 4: Sistema de Notificações**
- [ ] Triggers para notificações automáticas
- [ ] Feed de atividades dos amigos

### **FASE 5: Mural Elo da Rota**
- [ ] Integrar eventos de confraria
- [ ] Upload de fotos
- [ ] Feed público

---

**Pronto para implementar!** 🚀
