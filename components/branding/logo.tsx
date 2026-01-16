import React from 'react';
import Image from 'next/image';

export function RotabusinessLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <Image
                    src="/images/logo-rotabusiness.png"
                    alt="Rota Business Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col leading-none font-extrabold uppercase tracking-tight text-primary">
                <span style={{ fontSize: size * 0.4 }}>Rota</span>
                <span style={{ fontSize: size * 0.4 }}>Business</span>
                <span style={{ fontSize: size * 0.4, color: 'hsl(var(--secondary))' }}>Club</span>
            </div>
        </div>
    )
}

export function RotabusinessIcon({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <Image
                src="/images/logo-rotabusiness.png"
                alt="Rota Business Icon"
                fill
                className="object-contain"
            />
        </div>
    )
}
