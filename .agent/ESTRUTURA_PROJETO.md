# 📁 ESTRUTURA DO PROJETO - Rota Business Club

> Documentação da organização de diretórios do projeto

---

## 🏗️ Estrutura Principal

```
/Legendarios
├── 📱 app/                    # Páginas Next.js (App Router)
├── 🧩 components/             # Componentes React
├── 📚 lib/                    # Bibliotecas e utilitários
├── 📄 docs/                   # Documentação organizada
├── 🗄️ sql/                    # Scripts SQL organizados
├── ⚙️ scripts/                # Scripts de automação
├── 🧪 tests/                  # Testes automatizados
├── 🤖 .agent/                 # Configuração do assistente IA
├── 🖼️ public/                 # Arquivos estáticos
├── 📦 types/                  # Definições TypeScript
└── 🔧 supabase/               # Configurações Supabase
```

---

## 🤖 .agent/ - Configuração IA

```
.agent/
├── 📁 context/                # Contexto do projeto
│   ├── CONTEXTO_PROJETO.md    # 📌 Ler no início de cada sessão
│   └── AGENTS.md              # Guia rápido para agentes
│
├── 📁 team/                   # Time de especialistas virtuais
│   └── ESPECIALISTAS.md       # Perfis completos do time
│
└── 📁 workflows/              # Comandos e workflows
    ├── lucas-ux.md            # /lucas-ux - UI/UX Designer
    ├── rafael-dba.md          # /rafael-dba - Arquiteto BD
    ├── carlos-backend.md      # /carlos-backend - Backend Dev
    └── marina-frontend.md     # /marina-frontend - Frontend Dev
```

---

## 📄 docs/ - Documentação

```
docs/
├── 📁 architecture/           # Documentos de arquitetura
│   ├── ARQUITETURA_*.md       # Desenhos de sistema
│   ├── REGRAS_*.md            # Regras de negócio
│   └── SISTEMA_*.md           # Especificações de sistemas
│
├── 📁 guides/                 # Guias práticos
│   ├── GUIA_*.md              # Como fazer X
│   ├── CONTAS_*.md            # Credenciais de teste
│   └── TESTAR_*.md            # Guias de teste
│
├── 📁 sessions/               # Histórico de sessões
│   ├── RESUMO_*.md            # Resumos diários
│   ├── CHANGELOG_*.md         # Logs de mudanças
│   └── PLANO_*.md             # Planos de trabalho
│
└── 📁 troubleshooting/        # Solução de problemas
    ├── TROUBLESHOOTING_*.md   # Diagnósticos
    ├── SOLUCAO_*.md           # Soluções aplicadas
    └── EMERGENCIA_*.md        # Procedimentos urgentes
```

---

## 🗄️ sql/ - Scripts SQL

```
sql/
├── 📁 migrations/             # Alterações de schema
│   ├── *_schema.sql           # Criação de tabelas
│   ├── *_triggers.sql         # Triggers
│   └── RLS_*.sql              # Políticas RLS
│
├── 📁 seeds/                  # Dados iniciais
│   ├── CRIAR_*.sql            # Criar registros
│   ├── CONFIGURAR_*.sql       # Configurações
│   └── ADICIONAR_*.sql        # Adicionar dados
│
├── 📁 deploy/                 # Scripts de deploy
│   └── DEPLOY_*.sql           # Deploy por feature
│
├── 📁 maintenance/            # Manutenção
│   ├── FIX_*.sql              # Correções
│   ├── LIMPAR_*.sql           # Limpeza
│   └── SYNC_*.sql             # Sincronização
│
├── 📁 debug/                  # Diagnóstico
│   ├── DEBUG_*.sql            # Debug específico
│   ├── CHECK_*.sql            # Verificações
│   └── VERIFICAR_*.sql        # Validações
│
└── 📁 tests/                  # Testes SQL
    ├── TEST_*.sql             # Testes automatizados
    └── VALIDACAO_*.sql        # Validações
```

---

## 📱 app/ - Páginas Next.js

```
app/
├── 📁 auth/                   # Autenticação
│   ├── login/                 # Página de login
│   ├── register/              # Registro
│   └── reset-password/        # Recuperar senha
│
├── 📁 dashboard/              # Área logada
│   ├── settings/              # Configurações
│   └── ...
│
├── 📁 admin/                  # Painel admin
│   ├── users/                 # Gestão de usuários
│   ├── plans/                 # Gestão de planos
│   └── ...
│
├── 📁 api/                    # API Routes
│   ├── system-message/        # Mensagens do sistema
│   ├── ocr/                   # OCR (Gorra)
│   └── ...
│
└── 📁 [slug]/[rotaNumber]/    # Perfis públicos
```

---

## 🧩 components/ - Componentes React

```
components/
├── 📁 chat/                   # Widget de chat
├── 📁 profile/                # Perfil do usuário
├── 📁 gamification/           # XP, medalhas, patentes
├── 📁 notifications/          # Centro de notificações
├── 📁 marketplace/            # Marketplace
├── 📁 layout/                 # Layout (header, footer)
└── 📁 ui/                     # Componentes base (shadcn)
```

---

## 📚 lib/ - Bibliotecas

```
lib/
├── 📁 auth/                   # Contexto de autenticação
│   └── context.tsx            # ⚠️ NÃO MODIFICAR sem necessidade
│
├── 📁 supabase/               # Clients Supabase
│   ├── client.ts              # Browser client
│   └── server.ts              # Server client
│
├── 📁 api/                    # Funções de API
│   └── gamification.ts        # 🔥 awardBadge()
│
└── 📁 data/                   # Dados estáticos
```

---

## 🎯 Comandos Rápidos

### Início de Sessão
```
"Leia .agent/context/CONTEXTO_PROJETO.md"
```

### Ativar Especialistas
```
/lucas-ux        → UI/UX Designer
/rafael-dba      → Arquiteto de BD
/carlos-backend  → Backend Developer
/marina-frontend → Frontend Developer
```

---

*Atualizado em: 23/01/2026*
