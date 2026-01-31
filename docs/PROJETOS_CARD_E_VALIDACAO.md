# 📊 CARD DE PROJETOS - ESPECIFICAÇÃO

> **Componente:** Card de Gestão de Projetos  
> **Localização:** Dashboard do Usuário  
> **Data:** 30/01/2026

---

## 🎨 DESIGN DO CARD

### Layout Visual

```
┌─────────────────────────────────────────────────┐
│ 💼 PROJETOS              [CONTADOR] 📍 0         │
│    Histórico profissional           TOTAL        │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │   ✓ 0        │  │   🕐 0               │    │
│  │ CONCLUÍDOS   │  │ EM ANDAMENTO         │    │
│  └──────────────┘  └──────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Seu histórico de projetos               │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Componente React

```tsx
// components/projects/ProjectsCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle, Clock, Bell } from 'lucide-react'
import Link from 'next/link'

interface ProjectsCardProps {
    userId: string
}

interface ProjectStats {
    total: number
    completed: number
    inProgress: number
    newProjects: number // Contador de projetos novos não visualizados
}

export function ProjectsCard({ userId }: ProjectsCardProps) {
    const [stats, setStats] = useState<ProjectStats>({
        total: 0,
        completed: 0,
        inProgress: 0,
        newProjects: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadStats()
        
        // Subscrição em tempo real para novos projetos
        const subscription = supabase
            .channel('project-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                // Incrementar contador quando novo projeto chega
                setStats(prev => ({
                    ...prev,
                    total: prev.total + 1,
                    newProjects: prev.newProjects + 1
                }))
                
                // Tocar som de notificação
                playNotificationSound()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    async function loadStats() {
        setLoading(true)
        
        // Buscar estatísticas
        const { data: projects } = await supabase
            .from('projects')
            .select('status, viewed')
            .or(`accepted_by.eq.${userId},requester_id.eq.${userId}`)
        
        const completed = projects?.filter(p => p.status === 'completed').length || 0
        const inProgress = projects?.filter(p => 
            p.status === 'accepted' || p.status === 'in_progress'
        ).length || 0
        const total = projects?.length || 0
        
        // Contar projetos não visualizados (novos)
        const { count: newCount } = await supabase
            .from('project_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('viewed', false)
        
        setStats({
            total,
            completed,
            inProgress,
            newProjects: newCount || 0
        })
        
        setLoading(false)
    }

    return (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-[#2E4A3E] p-2.5 rounded-lg">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold">PROJETOS</CardTitle>
                        <p className="text-sm text-gray-600">Histórico profissional</p>
                    </div>
                </div>
                
                {/* Contador de Novos Projetos */}
                <div className="relative">
                    <Bell className="h-6 w-6 text-gray-600" />
                    {stats.newProjects > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {stats.newProjects}
                        </Badge>
                    )}
                </div>
                
                {/* Total */}
                <div className="text-right">
                    <div className="text-3xl font-bold text-[#2E4A3E]">
                        {loading ? '-' : stats.total}
                    </div>
                    <p className="text-xs text-gray-600">TOTAL</p>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {loading ? '-' : stats.completed}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">CONCLUÍDOS</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                        <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {loading ? '-' : stats.inProgress}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">EM ANDAMENTO</p>
                    </div>
                </div>
                
                {/* Botão para ver histórico */}
                <Button 
                    asChild 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-50"
                >
                    <Link href="/dashboard/projects">
                        Seu histórico de projetos
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES COM CONTADOR

### Tabela: `project_notifications` (NOVA)

```sql
CREATE TABLE project_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    -- Tipos: 'new_project', 'project_accepted', 'project_delivered', 
    --        'project_confirmed', 'rating_request', 'project_cancelled'
    
    viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, project_id, notification_type)
);

CREATE INDEX idx_project_notif_user ON project_notifications(user_id);
CREATE INDEX idx_project_notif_viewed ON project_notifications(user_id, viewed);
```

### Função: Criar Notificação

```typescript
// lib/services/project-notifications.ts

interface CreateNotificationParams {
    userId: string
    projectId: string
    type: 'new_project' | 'project_accepted' | 'project_delivered' | 
          'project_confirmed' | 'rating_request' | 'project_cancelled'
    title: string
    body: string
    metadata?: Record<string, any>
}

export async function createProjectNotification(params: CreateNotificationParams) {
    const supabase = createClient()
    
    // 1. Criar notificação no sino (header bell)
    const { data: notification } = await supabase
        .from('notifications')
        .insert({
            user_id: params.userId,
            type: params.type,
            title: params.title,
            body: params.body,
            metadata: {
                project_id: params.projectId,
                ...params.metadata
            },
            read: false
        })
        .select()
        .single()
    
    // 2. Registrar na tabela de notificações de projetos
    await supabase
        .from('project_notifications')
        .insert({
            user_id: params.userId,
            project_id: params.projectId,
            notification_type: params.type,
            viewed: false
        })
    
    // 3. Enviar mensagem do admin
    await supabase.from('messages').insert({
        sender_id: process.env.NEXT_PUBLIC_ADMIN_USER_ID,
        receiver_id: params.userId,
        content: `${params.title}\n\n${params.body}`,
        type: 'project_notification'
    })
    
    // 4. Enviar email
    await fetch('/api/emails/send', {
        method: 'POST',
        body: JSON.stringify({
            to: params.metadata?.email,
            template: params.type,
            data: {
                title: params.title,
                body: params.body,
                project_id: params.projectId,
                ...params.metadata
            }
        })
    })
    
    return notification
}
```

### Hook: Contador de Notificações

```typescript
// hooks/use-project-notifications.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProjectNotifications(userId: string) {
    const [count, setCount] = useState(0)
    const supabase = createClient()
    
    useEffect(() => {
        // Carregar contagem inicial
        loadCount()
        
        // Subscrever a mudanças em tempo real
        const channel = supabase
            .channel('project-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, () => {
                setCount(prev => prev + 1)
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                // Se marcou como visualizado, diminuir contador
                if (payload.new.viewed && !payload.old.viewed) {
                    setCount(prev => Math.max(0, prev - 1))
                }
            })
            .subscribe()
        
        return () => {
            channel.unsubscribe()
        }
    }, [userId])
    
    async function loadCount() {
        const { count } = await supabase
            .from('project_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('viewed', false)
        
        setCount(count || 0)
    }
    
    async function markAsViewed(projectId: string) {
        await supabase
            .from('project_notifications')
            .update({ 
                viewed: true, 
                viewed_at: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .eq('project_id', projectId)
            .eq('viewed', false)
    }
    
    async function markAllAsViewed() {
        await supabase
            .from('project_notifications')
            .update({ 
                viewed: true, 
                viewed_at: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .eq('viewed', false)
    }
    
    return {
        count,
        markAsViewed,
        markAllAsViewed
    }
}
```

---

## ✅ SISTEMA DE VALIDAÇÃO DE ENTREGA

### Fluxo Completo

```
┌────────────────────────────────────────────────────┐
│ ETAPA 1: PROFISSIONAL MARCA COMO ENTREGUE         │
├────────────────────────────────────────────────────┤
│ 1. Profissional acessa projeto                     │
│ 2. Clica "Marcar como Entregue"                    │
│ 3. Adiciona:                                        │
│    - Fotos do resultado (opcional)                 │
│    - Descrição da entrega                          │
│ 4. Submete                                          │
│                                                     │
│ Sistema:                                            │
│ - Atualiza status → 'awaiting_confirmation'        │
│ - Salva fotos e descrição                          │
│ - NÃO adiciona VIGOR ainda (pendente confirmação)  │
└────────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────────┐
│ ETAPA 2: CLIENTE RECEBE NOTIFICAÇÃO (3 CANAIS)    │
├────────────────────────────────────────────────────┤
│ 📧 Email:                                           │
│    "✅ Projeto entregue! Confirme a conclusão"     │
│    [Botão: Confirmar Entrega]                      │
│    [Botão: Reportar Problema]                      │
│                                                     │
│ 🔔 Sino (Header):                                   │
│    Notificação com link para confirmar             │
│                                                     │
│ 💬 Chat:                                            │
│    Mensagem do admin com instruções                │
└────────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────────┐
│ ETAPA 3: CLIENTE CONFIRMA ENTREGA                  │
├────────────────────────────────────────────────────┤
│ Cliente acessa link de confirmação                 │
│                                                     │
│ Opção A: CONFIRMAR                                 │
│ - Sistema atualiza status → 'completed'            │
│ - Adiciona VIGOR ao profissional                   │
│ - Cria post no Feed NA ROTA                        │
│ - Redireciona para avaliação                       │
│                                                     │
│ Opção B: REPORTAR PROBLEMA                         │
│ - Modal pede descrição do problema                 │
│ - Status → 'disputed'                              │
│ - Notifica admin e profissional                    │
│ - Aguarda resolução manual                         │
└────────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────────┐
│ ETAPA 4: AVALIAÇÃO DO PROFISSIONAL                │
├────────────────────────────────────────────────────┤
│ Cliente é direcionado para página de avaliação     │
│                                                     │
│ Formulário:                                         │
│ - Rating (1-5 estrelas) ⭐⭐⭐⭐⭐                 │
│ - Comentário (opcional)                            │
│ - Tags de qualidades (opcional)                    │
│   [Pontual] [Profissional] [Criativo]             │
│                                                     │
│ Ao submeter:                                        │
│ - Salva avaliação                                  │
│ - Atualiza média do profissional                   │
│ - Notifica profissional                            │
│ - Adiciona badge se aplicável                      │
└────────────────────────────────────────────────────┘
```

---

## 💻 CÓDIGO DO FLUXO DE VALIDAÇÃO

### 1. Profissional Marca como Entregue

```typescript
// app/api/projects/[id]/deliver/route.ts

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { deliveryPhotos, deliveryDescription } = await req.json()
    const supabase = createClient()
    
    // 1. Atualizar projeto
    const { data: project } = await supabase
        .from('projects')
        .update({
            status: 'awaiting_confirmation',
            delivery_photos: deliveryPhotos,
            delivery_description: deliveryDescription,
            delivered_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single()
    
    // 2. Registrar atividade
    await supabase.from('project_activities').insert({
        project_id: params.id,
        user_id: project.accepted_by,
        action: 'marked_as_delivered',
        description: 'Profissional marcou projeto como entregue'
    })
    
    // 3. Notificar cliente (3 canais)
    await createProjectNotification({
        userId: project.requester_id || 'public',
        projectId: params.id,
        type: 'project_delivered',
        title: '✅  Projeto Entregue!',
        body: `O profissional marcou o projeto "${project.title}" como entregue. Por favor, confirme se está tudo correto.`,
        metadata: {
            email: project.requester_email,
            confirmation_link: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/confirm/${project.tracking_token}`,
            professional_name: project.accepted_by_name
        }
    })
    
    return Response.json({ success: true })
}
```

### 2. Página de Confirmação (Cliente)

```tsx
// app/projects/confirm/[token]/page.tsx

export default async function ConfirmProjectPage({ 
    params 
}: { 
    params: { token: string } 
}) {
    const supabase = createClient()
    
    const { data: project } = await supabase
        .from('projects')
        .select('*, accepted_by:profiles!accepted_by(*)')
        .eq('tracking_token', params.token)
        .single()
    
    if (!project) {
        return <div>Projeto não encontrado</div>
    }
    
    return (
        <div className="container max-w-4xl mx-auto py-12">
            <Card>
                <CardHeader>
                    <CardTitle>✅ Confirmar Entrega do Projeto</CardTitle>
                    <CardDescription>
                        {project.title}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {/* Informações do Projeto */}
                    <div>
                        <h3 className="font-semibold mb-2">Descrição Original:</h3>
                        <p className="text-gray-700">{project.description}</p>
                    </div>
                    
                    {/* Entrega do Profissional */}
                    <div>
                        <h3 className="font-semibold mb-2">Entrega do Profissional:</h3>
                        <p className="text-gray-700">{project.delivery_description}</p>
                        
                        {/* Fotos */}
                        {project.delivery_photos?.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {project.delivery_photos.map((photo, i) => (
                                    <img 
                                        key={i}
                                        src={photo}
                                        alt={`Foto ${i + 1}`}
                                        className="rounded-lg object-cover w-full h-48"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex gap-4">
                        <ConfirmDeliveryButton 
                            projectId={project.id}
                            trackingToken={params.token}
                        />
                        
                        <ReportProblemButton 
                            projectId={project.id}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
```

### 3. Confirmar Entrega

```typescript
// components/projects/ConfirmDeliveryButton.tsx
'use client'

export function ConfirmDeliveryButton({ 
    projectId, 
    trackingToken 
}: { 
    projectId: string
    trackingToken: string
}) {
    async function handleConfirm() {
        const response = await fetch(`/api/projects/${projectId}/confirm`, {
            method: 'POST'
        })
        
        if (response.ok) {
            // Redirecionar para página de avaliação
            window.location.href = `/projects/rate/${trackingToken}`
        }
    }
    
    return (
        <Button 
            onClick={handleConfirm}
            className="flex-1"
        >
            ✅ Confirmar Entrega
        </Button>
    )
}

// app/api/projects/[id]/confirm/route.ts
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    
    // 1. Atualizar status
    const { data: project } = await supabase
        .from('projects')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            confirmed_by_client: true
        })
        .eq('id', params.id)
        .select()
        .single()
    
    // 2. Adicionar VIGOR ao profissional
    const xp = calculateProjectXP(project)
    await supabase.rpc('add_user_xp', {
        p_user_id: project.accepted_by,
        p_xp_amount: xp,
        p_activity: 'project_completed',
        p_description: `Projeto confirmado: ${project.title}`
    })
    
    // 3. Criar post no Feed NA ROTA
    if (project.delivery_photos?.length > 0) {
        await supabase.from('posts').insert({
            user_id: project.accepted_by,
            content: `✅ Projeto concluído: ${project.title}\n\n${project.delivery_description}`,
            media_urls: project.delivery_photos,
            visibility: 'public',
            post_type: 'project_delivery'
        })
    }
    
    // 4. Verificar medalhas
    await checkProjectMedals(project.accepted_by)
    
    // 5. Notificar profissional
    await createProjectNotification({
        userId: project.accepted_by,
        projectId: params.id,
        type: 'project_confirmed',
        title: '🎉 Projeto Confirmado!',
        body: `O cliente confirmou a entrega do projeto "${project.title}". Você ganhou ${xp} pontos de VIGOR!`
    })
    
    return Response.json({ success: true })
}
```

### 4. Página de Avaliação

```tsx
// app/projects/rate/[token]/page.tsx

export default function RateProjectPage({ 
    params 
}: { 
    params: { token: string } 
}) {
    return (
        <div className="container max-w-2xl mx-auto py-12">
            <Card>
                <CardHeader>
                    <CardTitle>⭐ Avaliar Profissional</CardTitle>
                    <CardDescription>
                        Conte-nos como foi sua experiência
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <RatingForm trackingToken={params.token} />
                </CardContent>
            </Card>
        </div>
    )
}

// components/projects/RatingForm.tsx
'use client'

export function RatingForm({ trackingToken }: { trackingToken: string }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    
    async function handleSubmit() {
        setSubmitting(true)
        
        const response = await fetch(`/api/projects/rate/${trackingToken}`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment })
        })
        
        if (response.ok) {
            toast.success('Avaliação enviada! Obrigado pelo feedback.')
            // Redirecionar ou fechar
        }
        
        setSubmitting(false)
    }
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            {/* Rating Stars */}
            <div className="mb-6">
                <Label>Sua avaliação</Label>
                <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="text-3xl"
                        >
                            {star <= rating ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Comment */}
            <div className="mb-6">
                <Label>Comentário (opcional)</Label>
                <Textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte como foi trabalhar com este profissional..."
                    rows={4}
                />
            </div>
            
            <Button 
                type="submit" 
                className="w-full"
                disabled={rating === 0 || submitting}
            >
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
        </form>
    )
}
```

---

## 📊 ATUALIZAÇÃO DA ESTRUTURA DE DADOS

### Campos Adicionais na Tabela `projects`

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS confirmed_by_client BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS disputed BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Atualizar CHECK constraint do status
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
    CHECK (status IN (
        'pending', 
        'accepted', 
        'in_progress', 
        'awaiting_confirmation',  -- NOVO
        'completed', 
        'cancelled', 
        'disputed',               -- NOVO
        'no_interest'
    ));
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Notificações com Contador
- [ ] Criar tabela `project_notifications`
- [ ] Implementar função `createProjectNotification`
- [ ] Criar hook `useProjectNotifications`
- [ ] Atualizar componente do sino no header
- [ ] Adicionar subscrição em tempo real
- [ ] Implementar som de notificação

### Card de Projetos
- [ ] Criar componente `ProjectsCard`
- [ ] Integrar com estatísticas
- [ ] Adicionar contador visual
- [ ] Implementar link para histórico

### Sistema de Validação
- [ ] Endpoint de marcar como entregue
- [ ] Página de confirmação `/projects/confirm/[token]`
- [ ] Endpoint de confirmar entrega
- [ ] Endpoint de reportar problema
- [ ] Página de avaliação `/projects/rate/[token]`
- [ ] Salvamento de avaliações
- [ ] Cálculo de média de rating
- [ ] Atualização de perfil do profissional

---

**🎯 Próximo passo: Começar pela criação das tabelas SQL?**
