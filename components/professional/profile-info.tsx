'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Globe, Instagram, Linkedin } from 'lucide-react'

interface ProfileInfoProps {
    profile: any
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                        href={`mailto:${profile.email}`}
                        className="text-primary hover:underline"
                    >
                        {profile.email}
                    </a>
                </div>

                {/* Phone */}
                {profile.phone && (
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a
                            href={`tel:${profile.phone}`}
                            className="text-primary hover:underline"
                        >
                            {profile.phone}
                        </a>
                    </div>
                )}

                {/* Social Links */}
                {(profile.website_url || profile.instagram_url || profile.linkedin_url) && (
                    <div className="pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Redes Sociais</p>
                        <div className="flex flex-col gap-2">
                            {profile.website_url && (
                                <a
                                    href={profile.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Globe className="w-4 h-4" />
                                    Website
                                </a>
                            )}

                            {profile.instagram_url && (
                                <a
                                    href={`https://instagram.com/${profile.instagram_url.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Instagram className="w-4 h-4" />
                                    Instagram
                                </a>
                            )}

                            {profile.linkedin_url && (
                                <a
                                    href={profile.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
