import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B00" />
                            <stop offset="100%" stopColor="#FF4500" />
                        </linearGradient>
                    </defs>

                    {/* Mountain & Pickaxe Icon - Original */}
                    <g transform="translate(5, 5) scale(0.8)">
                        <path
                            d="M25 5 L5 40 H45 L25 5Z"
                            fill="url(#iconGradient)"
                        />
                        <path
                            d="M15 15 Q 30 5, 45 15"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <line x1="30" y1="10" x2="30" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </g>
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
