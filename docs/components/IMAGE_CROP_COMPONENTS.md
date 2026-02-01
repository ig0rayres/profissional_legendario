# Componentes de Crop de Imagem

## Visão Geral

Existem **2 componentes** de crop de imagem no projeto, cada um usado em contextos diferentes.

---

## 1. ImageCropDialog (Admin)

**Arquivo:** `components/admin/ImageCropDialog.tsx`

**Usado em:**
- `/admin/rota-valente` - Prêmios de temporada
- Qualquer componente admin que importe `ImageCropDialog` de `@/components/admin/ImageCropDialog`

**Características:**
- Crop quadrado (250px container, 400px output)
- Zoom via slider (50% - 250%)
- Drag para reposicionar
- Retorna blob URL

**Props:**
```typescript
interface ImageCropDialogProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    onCropComplete: (croppedImageUrl: string) => void
    aspectRatio?: number // (não utilizado atualmente)
}
```

---

## 2. ImageCropDialog (UI)

**Arquivo:** `components/ui/image-crop-dialog.tsx`

**Usado em:**
- Marketplace - Upload de imagens de produtos
- Perfil - Avatar e capa
- Qualquer componente que importe de `@/components/ui/image-crop-dialog`

**Características:**
- Suporta aspecto quadrado (1:1) e panorâmico (3:1)
- Área de crop em formato losango (rotação 45°) para avatares
- Zoom via slider (5% - 150%)
- Drag para reposicionar
- Retorna Blob

**Props:**
```typescript
interface ImageCropDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageSrc: string
    aspectRatio?: number // 1 para quadrado, 3 para capa
    onCropComplete: (croppedBlob: Blob) => void
    title?: string
}
```

---

## Diferenças Principais

| Característica | Admin (`/admin/`) | UI (`/ui/`) |
|----------------|-------------------|-------------|
| Retorno | Blob URL (string) | Blob |
| Formato | Quadrado | Quadrado ou Losango |
| Aspect Ratio | Fixo 1:1 | Configurável |
| Uso | Painel administrativo | Usuário final |

---

## Quando Modificar

- **Problemas no crop de prêmios/temporadas:** Editar `components/admin/ImageCropDialog.tsx`
- **Problemas no crop de avatar/produtos:** Editar `components/ui/image-crop-dialog.tsx`

---

## Histórico de Correções

### 2026-02-01
- **ImageCropDialog (Admin):** Corrigido cálculo de posição que ignorava o drag do usuário
- **ImageCropDialog (UI):** Simplificado cálculo de crop para losango com zoomFactor correto
