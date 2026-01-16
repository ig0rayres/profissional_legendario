export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    cpf: string
                    email: string
                    role: 'professional' | 'admin' | 'user'
                    verification_status: 'pending' | 'verified' | 'rejected'
                    top_id: string | null
                    avatar_url: string | null
                    avatar_storage_path: string | null
                    bio: string | null
                    phone: string | null
                    skills: string[]
                    portfolio_description: string | null
                    website_url: string | null
                    instagram_url: string | null
                    linkedin_url: string | null
                    average_rating: number
                    total_ratings: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    cpf: string
                    email: string
                    role?: 'professional' | 'admin' | 'user'
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    top_id?: string | null
                    avatar_url?: string | null
                    avatar_storage_path?: string | null
                    bio?: string | null
                    phone?: string | null
                    skills?: string[]
                    portfolio_description?: string | null
                    website_url?: string | null
                    instagram_url?: string | null
                    linkedin_url?: string | null
                    average_rating?: number
                    total_ratings?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    cpf?: string
                    email?: string
                    role?: 'professional' | 'admin' | 'user'
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    top_id?: string | null
                    avatar_url?: string | null
                    avatar_storage_path?: string | null
                    bio?: string | null
                    phone?: string | null
                    skills?: string[]
                    portfolio_description?: string | null
                    website_url?: string | null
                    instagram_url?: string | null
                    linkedin_url?: string | null
                    average_rating?: number
                    total_ratings?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            portfolio_items: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    image_url: string
                    image_storage_path: string
                    display_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    image_url: string
                    image_storage_path: string
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    image_url?: string
                    image_storage_path?: string
                    display_order?: number
                    created_at?: string
                }
            }
            tops: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                }
            }
            branding_settings: {
                Row: {
                    id: string
                    top_id: string
                    logo_url: string | null
                    auth_background_url: string | null
                    primary_color: string
                    secondary_color: string
                    accent_color: string
                    background_color: string
                    foreground_color: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    top_id: string
                    logo_url?: string | null
                    auth_background_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    background_color?: string
                    foreground_color?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    top_id?: string
                    logo_url?: string | null
                    auth_background_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    background_color?: string
                    foreground_color?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            plans: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    price: number
                    features: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    price: number
                    features?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    price?: number
                    features?: string[]
                    created_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan_id: string
                    status: string
                    current_period_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan_id: string
                    status?: string
                    current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan_id?: string
                    status?: string
                    current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            ratings: {
                Row: {
                    id: string
                    professional_id: string
                    reviewer_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    professional_id: string
                    reviewer_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    professional_id?: string
                    reviewer_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            rating_responses: {
                Row: {
                    id: string
                    rating_id: string
                    response: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    rating_id: string
                    response: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    rating_id?: string
                    response?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
