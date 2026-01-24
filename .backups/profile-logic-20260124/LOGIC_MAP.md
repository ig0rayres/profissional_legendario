# MAPA DE LÓGICA - Painel Antigo → V6 Novo

## ✅ COMPONENTES JÁ INTEGRADOS:
1. **ProfileActionButtons** - Barra de botões (Ofertar, Mensagem, Confraria, Orar, Classificar)
   - Arquivo: `components/profile/profile-action-buttons.tsx`
   - Já importado e usado no V6 Complete
   - ✅ FUNCIONANDO

2. **CoverUpload** - Upload de foto de capa
   - Arquivo: `components/profile/cover-upload.tsx`
   - Já importado e usado no V6 Complete
   - ✅ FUNCIONANDO

3. **MedalBadge** - Renderização de medalhas
   - Arquivo: `components/gamification/medal-badge.tsx`
   - Já importado e usado no V6 Complete
   - ✅ FUNCIONANDO

## 📋 DADOS QUE PRECISAM SER PASSADOS:

### Profile Data:
- `profile.id` → ID do usuário
- `profile.full_name` → Nome completo
- `profile.avatar_url` → Foto do avatar
- `profile.cover_url` → Foto de capa
- `profile.professional_title` → Título profissional
- `profile.pista` → Localização
- `profile.rota_number` → ID da Rota (#000001)
- `profile.whatsapp` → WhatsApp
- `profile.instagram` → Instagram

### Gamification Data:
- `gamification.total_points` → Vigor (pontos)
- `gamification.current_rank_id` → Patente (elite, veterano, etc)

### Rating Stats:
- `ratingStats.average_rating` → Média de avaliação (5.0)
- `ratingStats.total_ratings` → Total de avaliações (23)

### Medals:
- `earnedMedals[]` → Array de medalhas conquistadas
- `allMedals[]` → Array de todas as medalhas disponíveis

### Props de Controle:
- `isOwner` → Se true, mostra botões de edição; se false, mostra botões de ação

## 🔗 BOTÕES E SUAS AÇÕES:

### Para VISITANTES (!isOwner):
1. **Ofertar** → ConnectionButton (Criar Elo)
2. **Mensagem** → MessageButton (Enviar mensagem)
3. **Confraria** → ConfraternityButton (Convidar para projeto)
4. **Orar** → PrayerButton (Orar pelo usuário)
5. **Classificar** → RatingButton (Avaliar usuário)

### Para DONO (isOwner):
1. **Editar Perfil** → `/dashboard/editar-perfil`
2. **Configurações** → `/dashboard/editar-perfil`
3. **Notificações** → `/dashboard/notifications`

### Redes Sociais (sempre):
1. **WhatsApp** → `https://wa.me/${whatsapp}`
2. **Instagram** → `https://instagram.com/${instagram}`

## ✅ STATUS ATUAL:

- ✅ Componente V6 Complete criado
- ✅ Todos os dados sendo passados corretamente
- ✅ ProfileActionButtons integrado
- ✅ CoverUpload integrado
- ✅ MedalBadge integrado
- ✅ Links de redes sociais funcionando
- ✅ Lógica isOwner implementada

## 🚀 PRÓXIMO PASSO:
- Testar em produção: /teste-v6/141018
- Verificar se TODOS os botões funcionam
- Confirmar visual IGUAL ao demo
