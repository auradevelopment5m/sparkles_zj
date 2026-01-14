"use client"

import type React from "react"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { RedeemableImage } from "@/lib/types"

export default function EditRedeemablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [images, setImages] = useState<{ id?: string; url: string; isPrimary: boolean }[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: 100,
    stock: 1,
    is_active: true,
  })

  useEffect(() => {
    loadRedeemable()
  }, [id])

  const loadRedeemable = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("redeemable_items")
      .select("*, images:redeemable_images(*)")
      .eq("id", id)
      .single()

    if (data) {
      setFormData({
        name: data.name,
        description: data.description || "",
        points_required: data.points_required,
        stock: data.stock,
        is_active: data.is_active,
      })
      setImages(
        (data.images || []).map((img: RedeemableImage) => ({
          id: img.id,
          url: img.image_url,
          isPrimary: img.is_primary,
        })),
      )
    }
    setIsLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `redeemables/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage.from("products").upload(fileName, file)

        if (error) throw error

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(data.path)

        return urlData.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [
        ...prev,
        ...uploadedUrls.map((url, i) => ({
          url,
          isPrimary: prev.length === 0 && i === 0,
        })),
      ])
      toast.success("Images uploaded")
    } catch (error) {
      toast.error("Failed to upload images")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = async (index: number) => {
    const img = images[index]
    if (img.id) {
      const supabase = createClient()
      await supabase.from("redeemable_images").delete().eq("id", img.id)
    }

    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true
      }
      return newImages
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error("Please enter a name")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("redeemable_items")
        .update({
          name: formData.name,
          description: formData.description || null,
          points_required: formData.points_required,
          stock: formData.stock,
          is_active: formData.is_active,
        })
        .eq("id", id)

      if (updateError) throw updateError

      // Handle images
      const existingImageIds = images.filter((img) => img.id).map((img) => img.id)
      const newImages = images.filter((img) => !img.id)

      // Update existing images
      for (const img of images.filter((img) => img.id)) {
        await supabase
          .from("redeemable_images")
          .update({
            is_primary: img.isPrimary,
          })
          .eq("id", img.id)
      }

      // Insert new images
      if (newImages.length > 0) {
        const imageInserts = newImages.map((img, index) => ({
          redeemable_id: id,
          image_url: img.url,
          is_primary: img.isPrimary,
          sort_order: existingImageIds.length + index,
        }))

        await supabase.from("redeemable_images").insert(imageInserts)
      }

      toast.success("Redeemable item updated")
      router.push("/admin/redeemables")
    } catch (error) {
      toast.error("Failed to update redeemable item")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/redeemables">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Redeemables
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Redeemable Item</h1>
        <p className="text-muted-foreground">Update this reward item</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Manage images for this redeemable item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div
                  key={img.id || i}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    img.isPrimary ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img.url || "/placeholder.svg"} alt={`Image ${i + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryImage(i)}
                      disabled={img.isPrimary}
                    >
                      {img.isPrimary ? "Primary" : "Set Primary"}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <label className="relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
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
            <CardTitle>Details</CardTitle>
            <CardDescription>Update information about this redeemable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Limited Edition Canvas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A beautiful exclusive piece..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points Required *</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_required: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Make this item available for redemption</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/redeemables">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
