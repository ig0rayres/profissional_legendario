import React from 'react';

// Shared Gradients
const LogoDefs = () => (
    <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

// Option 1: The Summit (Dynamic, Growth, Path)
export function LogoOption1({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <svg width={size * 6} height={size} viewBox="0 0 300 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <LogoDefs />
            {/* Icon */}
            <g transform="translate(0, 5) scale(0.8)">
                <path d="M10 40 L25 10 L40 40" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M25 10 L40 25 L55 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
                <circle cx="25" cy="10" r="3" fill="currentColor" />
            </g>
            {/* Text */}
            <g transform="translate(60, 0)">
                <text x="0" y="18" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="currentColor" letterSpacing="4" opacity="0.9">PROFISSIONAL</text>
                <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="900" fill="url(#logoGradient)" letterSpacing="1">LEGENDÁRIO</text>
            </g>
        </svg>
    );
}

// Option 2: The Badge (Security, Elite, Quality)
export function LogoOption2({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <svg width={size * 6} height={size} viewBox="0 0 300 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <LogoDefs />
            {/* Icon */}
            <g transform="translate(5, 2) scale(0.9)">
                <path d="M25 2 L45 12 V25 C45 36 36 46 25 48 C14 46 5 36 5 25 V12 L25 2Z" fill="url(#logoGradient)" stroke="currentColor" strokeWidth="2" />
                <text x="25" y="32" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white">L</text>
            </g>
            {/* Text */}
            <g transform="translate(60, 0)">
                <text x="0" y="18" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="currentColor" letterSpacing="4" opacity="0.9">PROFISSIONAL</text>
                <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="900" fill="url(#logoGradient)" letterSpacing="1">LEGENDÁRIO</text>
            </g>
        </svg>
    );
}

// Option 3: The Construct (Tools, Building, Structure)
export function LogoOption3({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <svg width={size * 6} height={size} viewBox="0 0 300 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <LogoDefs />
            {/* Icon */}
            <g transform="translate(0, 5) scale(0.8)">
                <rect x="10" y="10" width="12" height="30" rx="2" fill="currentColor" />
                <rect x="10" y="28" width="30" height="12" rx="2" fill="url(#logoGradient)" />
                <path d="M30 10 L45 25 L30 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
            {/* Text */}
            <g transform="translate(60, 0)">
                <text x="0" y="18" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="currentColor" letterSpacing="4" opacity="0.9">PROFISSIONAL</text>
                <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="900" fill="url(#logoGradient)" letterSpacing="1">LEGENDÁRIO</text>
            </g>
        </svg>
    );
}
