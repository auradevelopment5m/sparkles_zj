import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import { AddToCartButton } from "@/components/store/add-to-cart-button"

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single()
  return data
}

async function getRelatedProducts(currentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .neq("id", currentId)
    .limit(4)
  return data || []
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, relatedProducts] = await Promise.all([getProduct(id), getRelatedProducts(id)])

  if (!product) {
    notFound()
  }

  const primaryImage = product.images?.find((img: { is_primary: boolean }) => img.is_primary) || product.images?.[0]
  const otherImages = product.images?.filter((img: { id: string }) => img.id !== primaryImage?.id) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={
                    primaryImage?.image_url ||
                    `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.is_limited && (
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    Limited Edition
                  </Badge>
                )}
              </div>
              {otherImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {otherImages.slice(0, 4).map((img: { id: string; image_url: string }) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={img.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold text-primary">${product.price}</p>
                  <Badge variant="secondary" className="text-sm">
                    +{product.points_value} points
                  </Badge>
                </div>
              </div>

              {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{product.stock <= 3 ? `Only ${product.stock} left!` : "In Stock"}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm text-red-500">Sold Out</span>
                  </>
                )}
              </div>

              {/* Add to Order */}
              <AddToCartButton product={product} />

              {/* Perks */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <p className="font-medium text-sm">What you get:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Hand-painted original artwork
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      {product.points_value} reward points
                    </li>
                    {product.is_limited && (
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Added to your collection (limited edition)
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Cash on delivery payment
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => {
                  const img = related.images?.find((i: { is_primary: boolean }) => i.is_primary) || related.images?.[0]
                  return (
                    <Card key={related.id} className="group overflow-hidden">
                      <Link href={`/store/${related.id}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={
                              img?.image_url ||
                              `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(related.name)}`
                            }
                            alt={related.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {related.name}
                          </h3>
                          <p className="text-lg font-bold text-primary">${related.price}</p>
                        </CardContent>
                      </Link>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
