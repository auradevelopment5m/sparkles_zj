"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleOrderNow = () => {
    // Navigate to booking page with product pre-selected
    router.push(`/booking?product=${product.id}`)
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" disabled={product.stock === 0} onClick={handleOrderNow}>
        <ShoppingBag className="mr-2 h-5 w-5" />
        {product.stock === 0 ? "Sold Out" : "Order Now"}
      </Button>
      {product.stock === 0 && (
        <div className="mt-2 flex flex-col items-center">
          <p className="text-sm text-center text-muted-foreground mb-2">Want something like this? Place a custom order.</p>
          <Button size="sm" variant="outline" onClick={() => router.push('/booking?tab=custom')}>Place Custom Order</Button>
        </div>
      )}
      <p className="text-xs text-center text-muted-foreground">Cash on Delivery • Free local delivery</p>
    </div>
  )
}
