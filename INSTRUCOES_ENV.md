# 🔑 Como Configurar o .env.local

## Problema Atual
O arquivo `.env.local` está com valores de exemplo e precisa das credenciais reais do Supabase.

## Solução Rápida

### 1. Acesse o Painel do Supabase
Vá para: https://supabase.com/dashboard/project/erzprkocwzgdjrsictps/settings/api

### 2. Copie as Credenciais
Na página de API Settings, você verá:
- **Project URL** (começa com `https://`)
- **anon public** (uma chave longa que começa com `eyJ`)

### 3. Atualize o .env.local
Abra o arquivo `.env.local` na raiz do projeto e substitua:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://erzprkocwzgdjrsictps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-aqui-a-chave-anon-public-do-painel

# OpenAI (opcional - para OCR da Gorra)
OPENAI_API_KEY=your-openai-key-here

# Resend (opcional - para emails)
RESEND_API_KEY=your-resend-key-here
```

### 4. Reinicie o Servidor
```bash
# Pare o servidor (Ctrl + C)
# Inicie novamente
npm run dev
```

## ⚠️ IMPORTANTE
- **NÃO COMITE** o `.env.local` com as chaves reais
- O arquivo já está no `.gitignore`
- As chaves do Vercel (produção) estão seguras e separadas

## Verificação
Após atualizar, acesse: http://localhost:3000/dashboard/editar-perfil

Se carregar sem erros, está funcionando! ✅
