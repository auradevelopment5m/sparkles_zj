import Link from "next/link"
import Image from "next/image"
import { Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { DeleteProductButton } from "@/components/admin/delete-product-button"

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .order("created_at", { ascending: false })
  return data || []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your canvas collection</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <div className="divide-y">
              {products.map((product) => {
                const img = product.images?.find((i: { is_primary: boolean }) => i.is_primary) || product.images?.[0]
                return (
                  <div key={product.id} className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{product.name}</p>
                        {product.is_limited && (
                          <Badge variant="destructive" className="text-xs">
                            Limited
                          </Badge>
                        )}
                        {product.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                        {!product.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>${product.price}</span>
                        <span>{product.points_value} pts</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Button asChild>
                <Link href="/admin/products/new">Add Your First Product</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
