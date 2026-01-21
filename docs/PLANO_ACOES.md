# 📋 Plano de Ações - Rota Business Club

*Atualizado em: 20/01/2026*

---

## ✅ Concluído

### Autenticação e Usuários
- [x] Login/Registro com Supabase Auth
- [x] Redirecionamento por role (admin/user)
- [x] Perfil de usuário com slug personalizado
- [x] Upload de avatar com crop
- [x] Upload de capa com crop interativo
- [x] **Verificação de Membro por Foto da Gorra** ✨ *20/01*
  - [x] OpenAI Vision para extração de ID
  - [x] Componente GorraOCR com upload/câmera/webcam
  - [x] Webcam no desktop (modal com preview ao vivo)
  - [x] Câmera nativa no mobile
  - [x] Persistência de dados do formulário
  - [x] Pistas dinâmicas do banco de dados
  - [x] ID Rota único (constraint + verificação)

### Gamificação
- [x] Sistema de XP e níveis
- [x] Patentes (Novato → Lenda)
- [x] Vigor mensal
- [x] Medalhas e conquistas
- [x] RankInsignia nos avatares
- [x] **Histórico de Batalha** - Card com histórico mensal ✨ *19/01*
  - [x] Colunas: Período, Patente, Rank, Confraria, Vigor
  - [x] Destaque Top 3 (troféu + cores)
  - [x] Dropdown de medalhas animado
  - [x] Animações de hover elegantes
  - [x] Script de dados de teste

### Conexões (Elos)
- [x] Solicitação de conexão
- [x] Aceitar/Recusar via notificação
- [x] Lista de elos no perfil
- [x] Atualização realtime

### Chat
- [x] Conversas 1:1
- [x] Mensagens em tempo real
- [x] Upload de arquivos (imagens, PDFs)
- [x] Exibição visual de arquivos
- [x] Emojis
- [x] Avatar no header do chat

### Confrarias
- [x] Convites para confraria
- [x] Aceitar/Recusar convites
- [x] Pontos por participação
- [x] Limites por plano

### Notificações
- [x] Centro de notificações
- [x] Notificações realtime
- [x] Sino no header (cor laranja)
- [x] Marcar como lido

### Admin
- [x] Dashboard administrativo
- [x] Gestão de usuários
- [x] Gestão de planos

### UI/UX
- [x] Header reorganizado
- [x] Profissionais reais na homepage
- [x] Página /professionals com dados reais
- [x] Design responsivo

---

## 🔴 PRÓXIMA SESSÃO - Testar Histórico de Batalha

- [ ] **Visualizar** o card no dashboard
- [ ] **Validar** todas as 6 patentes aparecem
- [ ] **Verificar** destaque do Top 3 funcionando
- [ ] **Testar** animações de hover e dropdown
- [ ] **Testar** tooltips não cortados
- [ ] **Ajustar** qualquer problema visual

---

## 🚧 Em Andamento / Próximos Passos

### 🔧 Configuração de Emails para Produção
- [ ] Criar conta Resend
- [ ] Gerar API Key
- [ ] Configurar SMTP no Supabase
- [ ] Ativar confirmação de email
- [ ] Testar cadastro completo
- [ ] OPCIONAL: Adicionar domínio customizado

### 🎮 Triggers de Medalhas
- [x] Alistamento Concluído (100 pts) ✅ *20/01*
- [x] Batismo de Excelência (200 pts) ✅ *20/01*
- [x] Anfitrião (150 pts) ✅ *20/01*
- [x] Presente (50 pts) ✅ *já existia*
- [x] Cronista (50 pts) ✅ *20/01*
- [x] Primeira Confraria (100 pts) ✅ *21/01*
- [x] Networker Ativo (200 pts) - **2 confrarias/mês** ✅ *21/01*
- [x] Líder de Confraria (500 pts) - **5 confrarias/mês** ✅ *21/01*
- [x] Mestre das Conexões (1000 pts) - **10 confrarias/mês** ✅ *21/01*
- [x] Cinegrafista de Campo (100 pts) ✅ *já existia*
- [ ] Primeiro Sangue (50 pts) - Primeira venda
- [ ] Missão Cumprida (100 pts) - Primeiro serviço
- [ ] Irmandade (75 pts) - Contratar membro
- [ ] Pronto para Missão (50 pts) - Responder rápido
- [ ] Inabalável (150 pts) - Média 5★ após 5 trabalhos
- [ ] Recrutador (150 pts) - Indicar 3 membros
- [ ] Sentinela Inabalável (200 pts) - Ativo 30 dias
- [ ] Veterano de Guerra (300 pts) - 20 serviços
- [ ] Sentinela de Elite (500 pts) - Elite 3 meses

### 🛒 Marketplace
- [ ] Listagem de produtos/serviços
- [ ] Categorias (Imóveis, Veículos, Serviços)
- [ ] Upload de fotos para anúncios
- [ ] Filtros de busca
- [ ] Contato via chat

### 📅 Eventos
- [ ] Criação de eventos
- [ ] Inscrições
- [ ] Integração com Google Calendar

### ⭐ Depoimentos
- [ ] Sistema de avaliações
- [ ] Exibição pública de depoimentos

### 📁 Projetos
- [ ] Lançar projeto
- [ ] Acompanhamento de status
- [ ] Notificações de atualização

### 💳 Pagamentos
- [ ] Integração com gateway de pagamento
- [ ] Gestão de assinaturas
- [ ] Histórico de transações

### 🔮 Melhorias Futuras
- [ ] Chat em grupo
- [ ] Chamadas de vídeo
- [ ] App mobile
- [ ] Push notifications
- [ ] Relatórios avançados

---

## 📁 Documentação Disponível

| Documento | Descrição |
|-----------|-----------|
| `docs/RESUMO_2026-01-19.md` | Sessão 19/01 - Histórico de Batalha |
| `docs/RESUMO_2026-01-18.md` | Sessão 18/01 - Chat, Header |
| `docs/CHAT_DOCUMENTATION.md` | Sistema de chat |
| `docs/GAMIFICATION_USER_GUIDE.md` | Guia de gamificação |
| `docs/AUTH_SYSTEM.md` | Sistema de autenticação |

---

## 🔧 Scripts SQL Úteis

| Script | Descrição |
|--------|-----------|
| `GERAR_HISTORICO_FICTO.sql` | Gerar dados de teste (24 meses) |
| `RESET_ELOS.sql` | Resetar conexões |
| `RESET_NOTIFICACOES.sql` | Limpar notificações |
| `FIX_PROFILES_RLS.sql` | Política RLS |

---

## 📊 Prioridades

| Prioridade | Tarefa |
|------------|--------|
| 🔴 Alta | Testar Histórico de Batalha |
| 🔴 Alta | Marketplace (core business) |
| 🔴 Alta | Pagamentos (monetização) |
| 🟡 Média | Emails de produção |
| 🟡 Média | Triggers de medalhas |
| 🟡 Média | Eventos |
| 🟢 Baixa | App mobile |
