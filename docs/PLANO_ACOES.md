# 📋 Plano de Ações - Rota Business Club

*Atualizado em: 19/01/2026*

---

## ✅ Concluído

### Autenticação e Usuários
- [x] Login/Registro com Supabase Auth
- [x] Redirecionamento por role (admin/user)
- [x] Perfil de usuário com slug personalizado
- [x] Upload de avatar com crop
- [x] Upload de capa com crop interativo

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
- [ ] Alistamento Concluído (50 pts)
- [ ] Batismo de Excelência (150 pts)
- [ ] Anfitrião (150 pts)
- [ ] Presente (50 pts)
- [ ] Cronista (100 pts)
- [ ] Líder de Confraria (200 pts)
- [ ] Outras medalhas

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
