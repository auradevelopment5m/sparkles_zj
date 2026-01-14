"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { CustomizationOption } from "@/lib/types"

export default function AdminCustomizationPage() {
  const [options, setOptions] = useState<CustomizationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newOption, setNewOption] = useState({ type: "size" as "size" | "material", name: "", price_modifier: 0 })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("customization_options").select("*").order("sort_order")
    setOptions(data || [])
    setIsLoading(false)
  }

  const addOption = async () => {
    if (!newOption.name) {
      toast.error("Please enter a name")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const maxOrder = options.filter((o) => o.type === newOption.type).length
      const { error } = await supabase.from("customization_options").insert({
        ...newOption,
        sort_order: maxOrder,
      })

      if (error) throw error

      toast.success("Option added")
      setIsDialogOpen(false)
      setNewOption({ type: "size", name: "", price_modifier: 0 })
      loadOptions()
    } catch (error) {
      toast.error("Failed to add option")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()
    await supabase.from("customization_options").update({ is_active: isActive }).eq("id", id)
    loadOptions()
  }

  const deleteOption = async (id: string) => {
    const supabase = createClient()
    await supabase.from("customization_options").delete().eq("id", id)
    toast.success("Option deleted")
    loadOptions()
  }

  const sizeOptions = options.filter((o) => o.type === "size")
  const materialOptions = options.filter((o) => o.type === "material")

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
          <h1 className="text-3xl font-bold">Customization Options</h1>
          <p className="text-muted-foreground">Manage canvas sizes and materials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Customization Option</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Tabs
                  value={newOption.type}
                  onValueChange={(v) => setNewOption({ ...newOption, type: v as "size" | "material" })}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="size">Size</TabsTrigger>
                    <TabsTrigger value="material">Material</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder={newOption.type === "size" ? "e.g., Large (60x60 cm)" : "e.g., Premium Canvas"}
                />
              </div>
              <div className="space-y-2">
                <Label>Price Modifier ($)</Label>
                <Input
                  type="number"
                  value={newOption.price_modifier}
                  onChange={(e) =>
                    setNewOption({ ...newOption, price_modifier: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g., 15 or -5"
                />
                <p className="text-xs text-muted-foreground">Use negative values for discounts</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addOption} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="sizes">
        <TabsList className="mb-6">
          <TabsTrigger value="sizes">Sizes ({sizeOptions.length})</TabsTrigger>
          <TabsTrigger value="materials">Materials ({materialOptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sizes">
          <Card>
            <CardContent className="p-0">
              {sizeOptions.length > 0 ? (
                <div className="divide-y">
                  {sizeOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.price_modifier > 0
                            ? `+$${option.price_modifier}`
                            : option.price_modifier < 0
                              ? `-$${Math.abs(option.price_modifier)}`
                              : "No modifier"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={option.is_active}
                          onCheckedChange={(checked) => toggleActive(option.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">No size options</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardContent className="p-0">
              {materialOptions.length > 0 ? (
                <div className="divide-y">
                  {materialOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.price_modifier > 0
                            ? `+$${option.price_modifier}`
                            : option.price_modifier < 0
                              ? `-$${Math.abs(option.price_modifier)}`
                              : "No modifier"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={option.is_active}
                          onCheckedChange={(checked) => toggleActive(option.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">No material options</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
