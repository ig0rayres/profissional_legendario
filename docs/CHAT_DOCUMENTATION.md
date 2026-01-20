# 📱 Documentação do Sistema de Chat

## Visão Geral

O sistema de chat permite comunicação em tempo real entre usuários da plataforma Rota Business Club. Utiliza Supabase Realtime para mensagens instantâneas e Supabase Storage para upload de arquivos.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatWidget                              │
│  (components/chat/chat-widget.tsx)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Conversas   │  │  Mensagens  │  │ Upload de Arquivos  │ │
│  │ (Lista)     │  │  (Chat)     │  │ (Storage)           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├──────────────────┬──────────────────┬───────────────────────┤
│   conversations  │    messages      │   chat-files (bucket) │
│   (tabela)       │    (tabela)      │   (storage)           │
└──────────────────┴──────────────────┴───────────────────────┘
```

---

## Tabelas do Banco de Dados

### `conversations`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID único da conversa |
| participant_1 | uuid | ID do primeiro participante |
| participant_2 | uuid | ID do segundo participante |
| last_message_at | timestamp | Data da última mensagem |
| last_message_preview | text | Preview da última mensagem |
| created_at | timestamp | Data de criação |

### `messages`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID único da mensagem |
| conversation_id | uuid | FK para conversations |
| sender_id | uuid | ID do remetente |
| content | text | Conteúdo da mensagem |
| read_at | timestamp | Data de leitura (null = não lido) |
| created_at | timestamp | Data de envio |

---

## Storage (Bucket: chat-files)

### Estrutura de Arquivos
```
chat-files/
└── chat/
    └── {conversation_id}/
        └── {timestamp}_{filename}
```

### Políticas de Acesso
- **Upload**: Usuários autenticados podem fazer upload
- **Download**: Usuários autenticados podem baixar
- **Delete**: Apenas o dono pode deletar

---

## Componente Principal

### `ChatWidget` (components/chat/chat-widget.tsx)

#### Estados
```typescript
const [isOpen, setIsOpen] = useState(false)           // Chat aberto/fechado
const [conversations, setConversations] = useState([]) // Lista de conversas
const [selectedConversation, setSelectedConversation] = useState(null) // Conversa ativa
const [messages, setMessages] = useState([])          // Mensagens da conversa
const [newMessage, setNewMessage] = useState('')      // Input de nova mensagem
const [unreadTotal, setUnreadTotal] = useState(0)     // Total de não lidas
const [showEmojiPicker, setShowEmojiPicker] = useState(false) // Picker de emoji
const [uploadingFile, setUploadingFile] = useState(false)     // Upload em progresso
```

#### Funções Principais

##### `loadConversations()`
Carrega todas as conversas do usuário logado.

##### `loadMessages(conversationId: string)`
Carrega mensagens de uma conversa específica.

##### `sendMessage()`
Envia uma nova mensagem de texto.

##### `handleFileUpload(file: File)`
Faz upload de arquivo para o Storage e envia link como mensagem.

##### `renderMessageContent(content: string, isMine: boolean)`
Renderiza o conteúdo da mensagem com suporte a:
- Texto simples
- Imagens (preview clicável)
- Arquivos (botão com ícone de anexo)

---

## Formato de Mensagens de Arquivo

### Imagem
```
📷 [Imagem: nome_do_arquivo.jpg](https://url_da_imagem)
```

### Arquivo (PDF, DOC, etc)
```
📎 [Arquivo: documento.pdf](https://url_do_arquivo)
```

---

## Realtime (Supabase)

O chat utiliza Supabase Realtime para:
1. **Novas mensagens**: Atualiza automaticamente quando recebe mensagem
2. **Status de leitura**: Marca mensagens como lidas
3. **Notificações**: Alerta quando há nova mensagem

```typescript
const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
        // Adiciona nova mensagem ao estado
    })
    .subscribe()
```

---

## Recursos Visuais

### Header do Chat
- Avatar do outro usuário (quando em conversa)
- Ícone de mensagens (quando na lista)
- Botões de minimizar/fechar

### Mensagens
- Balões verdes (próprias) à direita
- Balões cinza (recebidas) à esquerda
- Avatar do outro usuário nas mensagens recebidas
- Horário + indicador de leitura (✓ ou ✓✓)

### Arquivos
- Imagens: Preview inline com click para abrir
- Outros: Botão estilizado com ícone de anexo

### Emoji Picker
- Grid de emojis organizados por categoria
- Inserção no input de mensagem

---

## Criação de Nova Conversa

Para iniciar conversa com outro usuário:

```typescript
// Via botão no perfil do usuário
const { data: conversation } = await supabase
    .from('conversations')
    .insert({
        participant_1: currentUserId,
        participant_2: otherUserId
    })
    .select()
    .single()
```

---

## Limitações Conhecidas

1. **Tamanho de arquivo**: Máximo 5MB
2. **Tipos de arquivo**: Qualquer tipo é aceito
3. **Conversas**: Apenas 1:1 (não há grupos)

---

## Arquivos Relacionados

- `components/chat/chat-widget.tsx` - Componente principal
- `supabase/migrations/20260118_chat_storage.sql` - Setup do bucket
- `supabase/migrations/20260118_chat_system.sql` - Tabelas e políticas

---

## Scripts SQL Úteis

### Verificar conversas de um usuário
```sql
SELECT * FROM conversations 
WHERE participant_1 = 'user_id' OR participant_2 = 'user_id';
```

### Verificar mensagens de uma conversa
```sql
SELECT * FROM messages 
WHERE conversation_id = 'conv_id' 
ORDER BY created_at DESC;
```

### Limpar mensagens de teste
```sql
DELETE FROM messages WHERE conversation_id = 'conv_id';
```
