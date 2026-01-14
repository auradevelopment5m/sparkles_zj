"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Product, ProductImage } from "@/lib/types"

interface ProductFormProps {
  product?: Product & { images: ProductImage[] }
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    points_value: product?.points_value || 10,
    stock: product?.stock || 1,
    is_limited: product?.is_limited || false,
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  })

  const [images, setImages] = useState<{ url: string; isPrimary: boolean; id?: string }[]>(
    product?.images?.map((img) => ({ url: img.image_url, isPrimary: img.is_primary, id: img.id })) || [],
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage.from("products").upload(fileName, file)
        if (error) throw error

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(data.path)
        return urlData.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [
        ...prev,
        ...uploadedUrls.map((url, i) => ({ url, isPrimary: prev.length === 0 && i === 0 })),
      ])
      toast.success("Images uploaded")
    } catch (error) {
      toast.error("Failed to upload images")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true
      }
      return newImages
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.price <= 0) {
      toast.error("Please fill in required fields")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      let productId = product?.id

      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(formData).eq("id", product.id)
        if (error) throw error

        // Delete old images
        await supabase.from("product_images").delete().eq("product_id", product.id)
      } else {
        // Create new product
        const { data, error } = await supabase.from("products").insert(formData).select().single()
        if (error) throw error
        productId = data.id
      }

      // Add images
      if (images.length > 0 && productId) {
        const imageInserts = images.map((img, i) => ({
          product_id: productId,
          image_url: img.url,
          is_primary: img.isPrimary,
          sort_order: i,
        }))
        await supabase.from("product_images").insert(imageInserts)
      }

      toast.success(product ? "Product updated" : "Product created")
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save product")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sunset Dreams"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the canvas..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points Value</Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={formData.points_value}
              onChange={(e) => setFormData({ ...formData, points_value: Number.parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">Points customers earn when purchasing</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload product images (click star to set primary)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                <Image src={img.url || "/placeholder.svg"} alt={`Product ${i + 1}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(i)}
                    className={`p-1 rounded ${img.isPrimary ? "text-primary" : "text-background"}`}
                  >
                    <Star className="h-5 w-5" fill={img.isPrimary ? "currentColor" : "none"} />
                  </button>
                  <button type="button" onClick={() => removeImage(i)} className="p-1 text-red-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded border border-border/60">
                    Primary
                  </div>
                )}
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </>
              )}
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Product is visible in store</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Featured</Label>
              <p className="text-sm text-muted-foreground">Show on homepage</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Limited Edition</Label>
              <p className="text-sm text-muted-foreground">Adds to buyer&apos;s collection</p>
            </div>
            <Switch
              checked={formData.is_limited}
              onCheckedChange={(checked) => setFormData({ ...formData, is_limited: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
