# Changelog - Versão 2026-01-18

## Novidades e Melhorias

### 🖼️ Sistema de Crop de Imagem
- **Novo componente `ImageCropDialog`** - Dialog para recortar imagens antes do upload
- Suporte a **arraste e zoom** para posicionar a imagem
- Área de recorte fixa (circular para avatar, retangular para capa)
- Zoom de 30% a 300%
- Preview em tempo real da área de corte

### 📍 Sistema de Pistas (Localizações)
- **Nova tabela `pistas`** - Gerenciamento centralizado de localizações
- **Admin `/admin/pistas`** - Interface para CRUD de localizações
- **Select de pistas** no formulário de edição de perfil (substitui campo de texto)
- Organização por estado brasileiro
- Contador de membros por pista

### 🏷️ Sistema de Categorias de Serviço
- **Nova tabela `service_categories`** - Categorias gerenciadas pelo admin
- **Nova tabela `user_categories`** - Relacionamento many-to-many
- **Admin `/admin/categories`** - Interface completa para gestão de categorias
- Seletor de categorias/especialidades no perfil do usuário
- Ícones e cores personalizáveis por categoria

### 👤 Edição de Perfil (`/dashboard/editar-perfil`)
- Upload de **foto de perfil** com crop
- Upload de **foto de capa** com crop
- **Seletor de categorias** (especialidades)
- **Seletor de pistas** (localização)
- **Preview de URL** em tempo real (atualiza com o nome)
- **Slug dinâmico** - sempre atualiza baseado no nome atual
- Redirecionamento para dashboard após salvar

### 🔒 Segurança
- **Formulários de login/registro** - Proteção contra envio GET
- `method="post"` e `action="#"` explícitos
- Prevenção de credenciais na URL

### 🖼️ Avatar Display 360°
- Avatar atualizado em tempo real em toda plataforma:
  - **Header** - Foto de perfil ao lado das notificações
  - **Elos da Rota** - Avatares das conexões
  - **Próximas Confrarias** - Avatares dos parceiros
  - **Perfil público** - Avatar principal

### 🎖️ Componente RankInsignia
- Novo tamanho **'xs'** (extra small) para ícones menores
- Usado em avatares onde o espaço é limitado

## Arquivos Criados/Modificados

### Novos Arquivos
- `components/ui/image-crop-dialog.tsx` - Componente de crop
- `components/ui/slider.tsx` - Componente Slider (shadcn/ui)
- `components/ui/switch.tsx` - Componente Switch (shadcn/ui)
- `app/admin/pistas/page.tsx` - Admin de localizações
- `supabase/migrations/20260118_service_categories.sql` - Schema de categorias
- `supabase/migrations/20260118_pistas.sql` - Schema de pistas

### Arquivos Modificados
- `app/dashboard/editar-perfil/page.tsx` - Sistema de crop e categorias
- `app/auth/login/page.tsx` - Segurança do formulário
- `app/auth/register/page.tsx` - Segurança do formulário
- `app/admin/categories/page.tsx` - Reescrito para usar banco real
- `app/admin/layout.tsx` - Link para admin de pistas
- `components/layout/header.tsx` - Avatar do usuário
- `components/profile/elos-da-rota.tsx` - Busca avatar_url
- `components/profile/confraternity-stats.tsx` - Avatar maior, patente menor
- `components/gamification/rank-insignia.tsx` - Novo tamanho xs
- `lib/auth/context.tsx` - Interface User com avatar_url

## Dependências Adicionadas
- `react-image-crop` - Biblioteca de crop de imagem
- `@radix-ui/react-slider` - Componente Slider
- `@radix-ui/react-switch` - Componente Switch

## Migrations Pendentes (já executadas manualmente)
Se precisar executar novamente em outro ambiente:

```sql
-- Adicionar colunas na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS pista TEXT,
ADD COLUMN IF NOT EXISTS pista_id UUID REFERENCES public.pistas(id),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_pista_id ON public.profiles(pista_id);
```

## Próximos Passos Sugeridos
1. Implementar contagem automática de membros por pista (trigger)
2. Adicionar validação de tamanho máximo de imagem no crop
3. Cache de avatares para melhor performance
4. Testes E2E para fluxo de edição de perfil
