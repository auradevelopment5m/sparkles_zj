"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Upload, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Product, CustomizationOption } from "@/lib/types"

interface BookingFormProps {
  products: (Product & { images: { id: string; image_url: string; is_primary: boolean }[] })[]
  sizeOptions: CustomizationOption[]
  materialOptions: CustomizationOption[]
}

export function BookingForm({ products, sizeOptions, materialOptions }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedProduct = searchParams.get("product")

  const [orderType, setOrderType] = useState<"premade" | "custom">(preSelectedProduct ? "premade" : "custom")
  const [selectedProduct, setSelectedProduct] = useState<string>(preSelectedProduct || "")
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0]?.id || "")
  const [selectedMaterial, setSelectedMaterial] = useState<string>(materialOptions[0]?.id || "")
  const [customDescription, setCustomDescription] = useState("")
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Calculate price
  const getPrice = () => {
    let basePrice = 30 // Base price for custom orders

    if (orderType === "premade" && selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct)
      basePrice = product?.price || 30
    }

    const sizeModifier = sizeOptions.find((s) => s.id === selectedSize)?.price_modifier || 0
    const materialModifier = materialOptions.find((m) => m.id === selectedMaterial)?.price_modifier || 0

    return basePrice + sizeModifier + materialModifier
  }

  const getPoints = () => {
    if (orderType === "premade" && selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct)
      return product?.points_value || 10
    }
    return Math.floor(getPrice()) // 1 point per dollar for custom orders
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage.from("custom-orders").upload(fileName, file)

        if (error) throw error

        const { data: urlData } = supabase.storage.from("custom-orders").getPublicUrl(data.path)

        return urlData.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setReferenceImages((prev) => [...prev, ...uploadedUrls])
      toast.success("Images uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload images")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone || !customerInfo.address) {
      toast.error("Please fill in all required fields")
      return
    }

    if (orderType === "premade" && !selectedProduct) {
      toast.error("Please select a product")
      return
    }

    if (orderType === "custom" && !customDescription) {
      toast.error("Please describe your custom canvas")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone,
          address: customerInfo.address,
          notes: customerInfo.notes,
          total_amount: getPrice(),
          points_earned: user ? getPoints() : 0,
          is_custom: orderType === "custom",
        })
        .select()
        .single()

      if (orderError) throw orderError

      if (orderType === "premade" && selectedProduct) {
        // Create order item for premade product
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: selectedProduct,
          price: getPrice(),
          size_option: sizeOptions.find((s) => s.id === selectedSize)?.name,
          material_option: materialOptions.find((m) => m.id === selectedMaterial)?.name,
        })

        if (itemError) throw itemError

        // Add to collection if limited and user is logged in
        const product = products.find((p) => p.id === selectedProduct)
        if (product?.is_limited && user) {
          await supabase
            .from("user_collections")
            .insert({
              user_id: user.id,
              product_id: selectedProduct,
              order_id: order.id,
            })
            .select()
            .single()
        }
      } else {
        // Create custom order
        const { error: customError } = await supabase.from("custom_orders").insert({
          order_id: order.id,
          description: customDescription,
          size_option: sizeOptions.find((s) => s.id === selectedSize)?.name,
          material_option: materialOptions.find((m) => m.id === selectedMaterial)?.name,
          reference_images: referenceImages,
        })

        if (customError) throw customError
      }

      toast.success("Order placed successfully! We'll contact you soon.")
      router.push(user ? "/account" : "/booking/success")
    } catch (error) {
      console.error(error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "premade" | "custom")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="premade">Pre-made Canvas</TabsTrigger>
          <TabsTrigger value="custom">Custom Order</TabsTrigger>
        </TabsList>

        {/* Pre-made Selection */}
        <TabsContent value="premade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Canvas</CardTitle>
              <CardDescription>Choose from our available collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) || product.images?.[0]
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                        selectedProduct === product.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {selectedProduct === product.id && (
                        <div className="absolute top-2 right-2 rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={
                              img?.image_url ||
                              `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(product.name)}`
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-primary font-semibold">${product.price}</p>
                          <p className="text-xs text-muted-foreground">+{product.points_value} pts</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {products.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No products available. Try a custom order instead!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Order */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Vision</CardTitle>
              <CardDescription>Tell us what you&apos;d like us to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the artwork you'd like... colors, style, subject, mood, etc."
                  rows={4}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reference Images (Optional)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {referenceImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image src={url || "/placeholder.svg"} alt={`Reference ${i + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customization Options */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customization</CardTitle>
          <CardDescription>Choose your size and material</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Size */}
          <div className="space-y-3">
            <Label>Canvas Size</Label>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid sm:grid-cols-2 gap-3">
              {sizeOptions.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                  <Label
                    htmlFor={option.id}
                    className="flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <span>{option.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.price_modifier > 0
                        ? `+$${option.price_modifier}`
                        : option.price_modifier < 0
                          ? `-$${Math.abs(option.price_modifier)}`
                          : "Included"}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Material */}
          <div className="space-y-3">
            <Label>Material</Label>
            <RadioGroup
              value={selectedMaterial}
              onValueChange={setSelectedMaterial}
              className="grid sm:grid-cols-2 gap-3"
            >
              {materialOptions.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                  <Label
                    htmlFor={option.id}
                    className="flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <span>{option.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.price_modifier > 0
                        ? `+$${option.price_modifier}`
                        : option.price_modifier < 0
                          ? `-$${Math.abs(option.price_modifier)}`
                          : "Included"}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>We need this to process your order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+224 600 00 00 00"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              placeholder="Your full delivery address..."
              required
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or instructions..."
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {orderType === "premade" && selectedProduct
                  ? products.find((p) => p.id === selectedProduct)?.name
                  : "Custom Canvas"}
              </span>
              <span>
                $
                {orderType === "premade" && selectedProduct
                  ? products.find((p) => p.id === selectedProduct)?.price
                  : 30}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{sizeOptions.find((s) => s.id === selectedSize)?.name}</span>
              <span>
                {(sizeOptions.find((s) => s.id === selectedSize)?.price_modifier || 0) > 0
                  ? `+$${sizeOptions.find((s) => s.id === selectedSize)?.price_modifier}`
                  : (sizeOptions.find((s) => s.id === selectedSize)?.price_modifier || 0) < 0
                    ? `-$${Math.abs(sizeOptions.find((s) => s.id === selectedSize)?.price_modifier || 0)}`
                    : "$0"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {materialOptions.find((m) => m.id === selectedMaterial)?.name}
              </span>
              <span>
                {(materialOptions.find((m) => m.id === selectedMaterial)?.price_modifier || 0) > 0
                  ? `+$${materialOptions.find((m) => m.id === selectedMaterial)?.price_modifier}`
                  : (materialOptions.find((m) => m.id === selectedMaterial)?.price_modifier || 0) < 0
                    ? `-$${Math.abs(materialOptions.find((m) => m.id === selectedMaterial)?.price_modifier || 0)}`
                    : "$0"}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">${getPrice()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cash on Delivery • You&apos;ll earn +{getPoints()} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          `Place Order - $${getPrice()}`
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-3">
        By placing an order, you agree to our terms. Payment is cash on delivery.
      </p>
    </form>
  )
}
