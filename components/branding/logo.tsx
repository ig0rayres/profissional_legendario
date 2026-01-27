import React from 'react';
import Image from 'next/image';

export function RotabusinessLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <div className={`relative ${className}`} style={{ width: size * 4, height: size }}>
            <Image
                src="/images/logo-rotabusiness.png"
                alt="Rota Business Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    )
}

export function RotabusinessIcon({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <Image
                src="/images/brasao-rota.png"
                alt="Rota Business Icon"
                fill
                className="object-contain"
            />
        </div>
    )
}
