'use client'

import { Star } from 'lucide-react'

interface RatingDisplayProps {
    rating: number
    size?: 'sm' | 'md' | 'lg'
    showNumber?: boolean
}

export function RatingDisplay({ rating, size = 'md', showNumber = true }: RatingDisplayProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    }

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    }

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${star <= rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-600'
                        }`}
                />
            ))}
            {showNumber && (
                <span className={`ml-1 font-medium text-yellow-500 ${textSizeClasses[size]}`}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    )
}

interface RatingInputProps {
    value: number
    onChange: (rating: number) => void
    size?: 'sm' | 'md' | 'lg'
}

export function RatingInput({ value, onChange, size = 'lg' }: RatingInputProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    }

    return (
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={(e) => {
                        // Highlight stars on hover
                        const stars = e.currentTarget.parentElement?.querySelectorAll('button')
                        stars?.forEach((s, i) => {
                            const starIcon = s.querySelector('svg')
                            if (i < star) {
                                starIcon?.classList.add('text-yellow-500', 'fill-yellow-500')
                                starIcon?.classList.remove('text-gray-600')
                            } else {
                                starIcon?.classList.remove('text-yellow-500', 'fill-yellow-500')
                                starIcon?.classList.add('text-gray-600')
                            }
                        })
                    }}
                    onMouseLeave={(e) => {
                        // Reset to actual value
                        const stars = e.currentTarget.parentElement?.querySelectorAll('button')
                        stars?.forEach((s, i) => {
                            const starIcon = s.querySelector('svg')
                            if (i < value) {
                                starIcon?.classList.add('text-yellow-500', 'fill-yellow-500')
                                starIcon?.classList.remove('text-gray-600')
                            } else {
                                starIcon?.classList.remove('text-yellow-500', 'fill-yellow-500')
                                starIcon?.classList.add('text-gray-600')
                            }
                        })
                    }}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`${sizeClasses[size]} transition-colors ${star <= value
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    )
}
