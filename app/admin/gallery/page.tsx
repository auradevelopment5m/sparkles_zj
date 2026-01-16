"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Trash2, GripVertical, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { FeaturedGallery } from "@/lib/types"

export default function AdminGalleryPage() {
  const [items, setItems] = useState<FeaturedGallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({ title: "", image_url: "" })
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("featured_gallery").select("*").order("sort_order")
    setItems(data || [])
    setIsLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("gallery").upload(fileName, file)
      if (error) throw error

      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(data.path)
      setNewItem({ ...newItem, image_url: urlData.publicUrl })
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const addItem = async () => {
    if (!newItem.image_url) {
      toast.error("Please upload an image")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("featured_gallery").insert({
        title: newItem.title || null,
        image_url: newItem.image_url,
        sort_order: items.length,
      })

      if (error) throw error

      toast.success("Gallery item added")
      setIsDialogOpen(false)
      setNewItem({ title: "", image_url: "" })
      loadGallery()
    } catch (error) {
      toast.error("Failed to add item")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()
    await supabase.from("featured_gallery").update({ is_active: isActive }).eq("id", id)
    loadGallery()
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from("featured_gallery").delete().eq("id", id)
    toast.success("Item deleted")
    loadGallery()
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Featured Gallery</h1>
          <p className="text-muted-foreground">Manage homepage gallery</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Nature Series"
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                {newItem.image_url ? (
                  <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                    <Image src={newItem.image_url || "/placeholder.svg"} alt="Preview" fill className="object-cover" sizes="192px" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload image</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addItem} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {items.map((item) => (
                <Card key={item.id} className="flex flex-col items-center justify-between w-64 h-64 p-4 shadow-md">
                  <div className="relative w-full h-40 aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title || "Gallery"}
                      fill
                      className="object-contain"
                      sizes="256px"
                    />
                  </div>
                  <div className="w-full flex-1 flex flex-col justify-between">
                    <p className="font-medium text-center truncate w-full">{item.title || "Untitled"}</p>
                  </div>
                  <div className="flex items-center justify-between w-full mt-2 gap-2">
                    <Switch checked={item.is_active} onCheckedChange={(checked) => toggleActive(item.id, checked)} />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No gallery items yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
