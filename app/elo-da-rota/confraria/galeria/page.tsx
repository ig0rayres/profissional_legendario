// ============================================
// Page: Galeria de Confraternizações
// /elo-da-rota/confraria/galeria
// ============================================

import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Globe, User } from 'lucide-react'
import { ConfraternityGallery } from '@/components/confraternity/ConfraternityGallery'

export const metadata = {
    title: 'Galeria de Confraternizações | Elo da Rota',
    description: 'Explore confraternizações da comunidade'
}

async function getConfraternities(userId?: string) {
    const supabase = createClient()

    // Públicas
    const { data: publicConfs } = await supabase
        .from('confraternities')
        .select(`
            *,
            member1:profiles!member1_id(id, full_name, avatar_url),
            member2:profiles!member2_id(id, full_name, avatar_url)
        `)
        .eq('visibility', 'public')
        .order('date_occurred', { ascending: false })
        .limit(30)

    // Minhas (se userId fornecido)
    let myConfs = []
    if (userId) {
        const { data } = await supabase
            .from('confraternities')
            .select(`
                *,
                member1:profiles!member1_id(id, full_name, avatar_url),
                member2:profiles!member2_id(id, full_name, avatar_url)
            `)
            .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
            .order('date_occurred', { ascending: false })

        myConfs = data || []
    }

    return {
        public: publicConfs || [],
        mine: myConfs
    }
}

export default async function ConfraternitiesGalleryPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { public: publicConfs, mine: myConfs } = await getConfraternities(user?.id)

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Users className="h-10 w-10 text-primary" />
                    Galeria de Confraternizações
                </h1>
                <p className="text-muted-foreground text-lg">
                    Networking que gera resultados reais
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="public" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="public" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Públicas ({publicConfs.length})
                    </TabsTrigger>
                    {user && (
                        <TabsTrigger value="mine" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Minhas ({myConfs.length})
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Públicas */}
                <TabsContent value="public">
                    <ConfraternityGallery
                        confraternities={publicConfs}
                        currentUserId={user?.id}
                    />
                </TabsContent>

                {/* Minhas */}
                {user && (
                    <TabsContent value="mine">
                        <ConfraternityGallery
                            confraternities={myConfs}
                            currentUserId={user.id}
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
