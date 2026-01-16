export interface MarketplaceItem {
    id: string;
    title: string;
    price: number;
    description: string;
    category: string;
    image_url: string;
    seller_id: string;
    seller_name: string;
    created_at: string;
    location: string;
    condition?: 'new' | 'used_like_new' | 'used_good' | 'used_fair';
    type?: 'sale' | 'rent'; // For Real Estate
    vehicle_details?: VehicleDetails;
    property_details?: PropertyDetails;
}

export interface VehicleDetails {
    year: number;
    make: string;
    model: string;
    km: number;
    color: string;
}

export interface PropertyDetails {
    type: 'venda' | 'locação';
    area: number;
    bedrooms?: number;
    bathrooms?: number;
}

export const MARKETPLACE_CATEGORIES = [
    "Veículos",
    "Imóveis",
    "Artigos domésticos",
    "Artigos esportivos",
    "Artigos para animais de estimação",
    "Artigos para escritório",
    "Brinquedos e jogos",
    "Classificados",
    "Eletrônicos",
    "Entretenimento",
    "Família",
    "Hobbies",
    "Instrumentos musicais",
    "Itens gratuitos",
    "Jardim e ambientes externos",
    "Suprimentos para reforma residencial",
    "Vestuário",
    "OUTROS"
] as const;

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
    {
        id: '1',
        title: 'Toyota Hilux SRX 2023',
        price: 285000,
        description: 'Caminhonete em estado de zero, apenas 15.000km rodados. Todas as revisões na concessionária.',
        category: 'Veículos',
        image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80',
        seller_id: 'user_1',
        seller_name: 'Carlos Mendes',
        created_at: '2024-01-10T10:00:00Z',
        location: 'São Paulo, SP',
        condition: 'used_like_new',
        vehicle_details: {
            year: 2023,
            make: 'Toyota',
            model: 'Hilux SRX',
            km: 15000,
            color: 'Preto'
        }
    },
    {
        id: 'real-1',
        title: 'Apartamento de Luxo - Setor Marista',
        price: 1250000,
        description: 'Lindo apartamento com 3 suítes, varanda gourmet e lazer completo.',
        category: 'Imóveis',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
        seller_id: 'user_3',
        seller_name: 'Imobiliária Rota',
        created_at: '2024-01-14T09:00:00Z',
        location: 'Goiânia, GO',
        property_details: {
            type: 'venda',
            area: 120,
            bedrooms: 3,
            bathrooms: 4
        }
    },
    {
        id: 'real-2',
        title: 'Sala Comercial Ed. Business',
        price: 4500,
        description: 'Sala pronta para uso com ar condicionado, móveis e excelente localização.',
        category: 'Imóveis',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
        seller_id: 'user_3',
        seller_name: 'Imobiliária Rota',
        created_at: '2024-01-14T10:00:00Z',
        location: 'São Paulo, SP',
        property_details: {
            type: 'locação',
            area: 45,
            bathrooms: 1
        }
    },
    {
        id: '2',
        title: 'MacBook Pro M2 Max',
        price: 18500,
        description: 'Notebook ultra potente para edição de vídeo e programação. Garantia Apple Care até 2025.',
        category: 'Eletrônicos',
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80',
        seller_id: 'user_2',
        seller_name: 'Matheus Artal',
        created_at: '2024-01-12T14:30:00Z',
        location: 'Ribeirão Preto, SP',
        condition: 'used_like_new'
    },
    {
        id: '3',
        title: 'Conjunto Mesa Executiva',
        price: 2500,
        description: 'Mesa em madeira maciça com cadeira ergonômica Herman Miller.',
        category: 'Artigos para escritório',
        image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80',
        seller_id: 'user_3',
        seller_name: 'Paulo Júnior',
        created_at: '2024-01-14T09:15:00Z',
        location: 'São Paulo, SP',
        condition: 'used_good'
    },
    {
        id: '4',
        title: 'Kit Pesca Profissional',
        price: 1200,
        description: 'Varas, molinetes e caixa de iscas completa. Pouco uso.',
        category: 'Hobbies',
        image_url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80',
        seller_id: 'user_4',
        seller_name: 'Pr. Silvio',
        created_at: '2024-01-13T16:20:00Z',
        location: 'Campinas, SP',
        condition: 'used_good'
    },
    {
        id: '5',
        title: 'Jeep Compass Longitude',
        price: 145000,
        description: 'Único dono, sem detalhes. Pneus novos.',
        category: 'Veículos',
        image_url: 'https://images.unsplash.com/photo-1626082927389-d52b96e852d9?auto=format&fit=crop&q=80',
        seller_id: 'user_1',
        seller_name: 'Carlos Mendes',
        created_at: '2024-01-11T11:00:00Z',
        location: 'São Paulo, SP',
        condition: 'used_good',
        vehicle_details: {
            year: 2021,
            make: 'Jeep',
            model: 'Compass Longitude',
            km: 45000,
            color: 'Branco'
        }
    }
];
