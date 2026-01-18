-- Migration: Criar tabela de categorias de serviço e relacionamento com usuários
-- Data: 2026-01-18

-- Tabela de Categorias de Serviço
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Tag',  -- Nome do ícone Lucide
    color TEXT DEFAULT '#3B82F6',  -- Cor hex
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de relacionamento entre Usuários e Categorias (muitos para muitos)
CREATE TABLE IF NOT EXISTS public.user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, category_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(active);
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_category_id ON public.user_categories(category_id);

-- RLS para service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias são públicas para leitura" ON public.service_categories
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar categorias" ON public.service_categories
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas admins podem editar categorias" ON public.service_categories
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas admins podem deletar categorias" ON public.service_categories
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS para user_categories
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias do usuário são públicas para leitura" ON public.user_categories
FOR SELECT USING (true);

CREATE POLICY "Usuários podem gerenciar suas próprias categorias" ON public.user_categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas próprias categorias" ON public.user_categories
FOR DELETE USING (auth.uid() = user_id);

-- Inserir categorias iniciais (baseadas nas mock)
INSERT INTO public.service_categories (name, slug, description, icon, color, active) VALUES
('Teologia', 'teologia', 'Estudos bíblicos, pregação e ensino teológico', 'Book', '#8B5CF6', true),
('Liderança', 'lideranca', 'Desenvolvimento de líderes e gestão de equipes', 'Users', '#3B82F6', true),
('Mentoria', 'mentoria', 'Acompanhamento pessoal e desenvolvimento individual', 'Heart', '#EC4899', true),
('Coordenação', 'coordenacao', 'Organização de eventos e gestão operacional', 'ClipboardList', '#10B981', true),
('Gestão de Equipes', 'gestao-equipes', 'Liderança de times e desenvolvimento organizacional', 'LayoutGrid', '#F59E0B', true),
('Marketing Digital', 'marketing-digital', 'Estratégias digitais, redes sociais e branding', 'TrendingUp', '#EF4444', true),
('Desenvolvimento', 'desenvolvimento', 'Programação, aplicativos e soluções tecnológicas', 'Code', '#6366F1', true),
('Consultoria Financeira', 'consultoria-financeira', 'Planejamento financeiro e gestão de investimentos', 'DollarSign', '#059669', true),
('Design Gráfico', 'design-grafico', 'Criação visual, identidade e materiais gráficos', 'Palette', '#8B5CF6', true),
('Recursos Humanos', 'recursos-humanos', 'Gestão de pessoas, recrutamento e cultura organizacional', 'UserCheck', '#14B8A6', true)
ON CONFLICT (slug) DO NOTHING;

-- Comentários
COMMENT ON TABLE public.service_categories IS 'Categorias de serviço/especialidades disponíveis na plataforma';
COMMENT ON TABLE public.user_categories IS 'Relacionamento entre usuários e suas categorias/especialidades';
