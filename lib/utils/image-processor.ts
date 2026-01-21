/**
 * Utilitário para pré-processamento de imagem
 * Otimizado para extrair texto laranja de fundo camuflado
 */

/**
 * Processa a imagem para extrair texto laranja
 * Converte para canvas, isola cor laranja, binariza
 */
export async function preprocessGorraImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            reject(new Error('Canvas não suportado'))
            return
        }

        img.onload = () => {
            // Definir tamanho do canvas
            canvas.width = img.width
            canvas.height = img.height

            // Desenhar imagem original
            ctx.drawImage(img, 0, 0)

            // Obter dados da imagem
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Processar cada pixel
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]     // Red
                const g = data[i + 1] // Green
                const b = data[i + 2] // Blue

                // Detectar cor LARANJA/TERRACOTA
                // A gorra tem laranja mais escuro/terracota
                // Ajustado para capturar mais tons de laranja
                const isOrange = (
                    // Laranja claro a escuro
                    (r > 120 && r < 255) &&     // Vermelho médio-alto
                    (g > 30 && g < 150) &&      // Verde baixo-médio
                    (b < 100) &&                 // Azul baixo
                    (r > g) &&                   // Mais vermelho que verde
                    (r - b > 30)                 // Diferença significativa R-B
                ) || (
                        // Laranja mais saturado
                        (r > 180) &&
                        (g > 60 && g < 130) &&
                        (b < 80)
                    )

                if (isOrange) {
                    // Pixel laranja -> PRETO (para OCR)
                    data[i] = 0
                    data[i + 1] = 0
                    data[i + 2] = 0
                } else {
                    // Outros pixels -> BRANCO
                    data[i] = 255
                    data[i + 1] = 255
                    data[i + 2] = 255
                }
            }

            // Aplicar imagem processada
            ctx.putImageData(imageData, 0, 0)

            // Converter para Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    console.log('[ImageProcessor] Imagem processada:', blob.size, 'bytes')
                    resolve(blob)
                } else {
                    reject(new Error('Falha ao criar blob'))
                }
            }, 'image/png')
        }

        img.onerror = () => {
            reject(new Error('Falha ao carregar imagem'))
        }

        // Carregar imagem do arquivo
        const reader = new FileReader()
        reader.onload = (e) => {
            img.src = e.target?.result as string
        }
        reader.onerror = () => {
            reject(new Error('Falha ao ler arquivo'))
        }
        reader.readAsDataURL(file)
    })
}

/**
 * Cria preview da imagem processada para debug
 */
export async function createProcessedPreview(file: File): Promise<string> {
    const blob = await preprocessGorraImage(file)
    return URL.createObjectURL(blob)
}
