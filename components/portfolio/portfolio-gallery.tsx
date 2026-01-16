'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PortfolioItem {
    id: string
    title: string
    description?: string
    image_url: string
}

interface PortfolioGalleryProps {
    items: PortfolioItem[]
    columns?: 2 | 3 | 4
}

export function PortfolioGallery({ items, columns = 3 }: PortfolioGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null)

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nenhuma imagem no portfólio.</p>
            </div>
        )
    }

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }

    return (
        <>
            <div className={`grid ${gridCols[columns]} gap-4`}>
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedImage(item)}
                        className="group relative aspect-video rounded-lg overflow-hidden bg-gray-800 border border-gray-700 hover:border-violet-500 transition-all"
                    >
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="font-medium text-white">{item.title}</h3>
                                {item.description && (
                                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <div
                        className="max-w-6xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.image_url}
                            alt={selectedImage.title}
                            className="w-full h-auto rounded-lg"
                        />

                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold text-white">
                                {selectedImage.title}
                            </h2>
                            {selectedImage.description && (
                                <p className="text-gray-300 mt-2">
                                    {selectedImage.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
