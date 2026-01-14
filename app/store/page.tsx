import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PaintSplatter } from "@/components/ui/paint-splatter"
import { createClient } from "@/lib/supabase/server"
import type { Product, ProductImage } from "@/lib/types"

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  return (data || []) as (Product & { images: ProductImage[] })[]
}

function ProductCard({ product }: { product: Product & { images: ProductImage[] } }) {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]

  return (
    <Card className="group overflow-hidden h-full">
      <Link href={`/store/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={
              primaryImage?.image_url ||
              `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name + " canvas art")}`
            }
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_limited && <Badge variant="destructive">Limited Edition</Badge>}
            {product.stock <= 3 && product.stock > 0 && <Badge variant="secondary">Only {product.stock} left</Badge>}
            {product.stock === 0 && (
              <Badge variant="outline" className="bg-background">
                Sold Out
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">${product.price}</p>
            <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">+{product.points_value} pts</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default async function StorePage() {
  const products = await getProducts()
  const limitedProducts = products.filter((p) => p.is_limited)
  const regularProducts = products.filter((p) => !p.is_limited)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <PaintSplatter variant="section" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Collection</h1>
              <p className="text-lg text-muted-foreground">
                Each canvas is hand-painted with love. Find the perfect piece for your space.
              </p>
            </div>
          </div>
        </section>

        {/* Limited Edition Section */}
        {limitedProducts.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <Badge variant="destructive" className="text-sm">
                  Limited Edition
                </Badge>
                <h2 className="text-2xl font-bold">Exclusive Pieces</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {limitedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">All Artworks</h2>
              <p className="text-muted-foreground">{regularProducts.length} pieces</p>
            </div>

            {regularProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No products available yet.</p>
                <Button asChild>
                  <Link href="/booking">Request Custom Art</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Commission a custom piece tailored to your vision. Tell us your ideas and we&apos;ll bring them to life.
            </p>
            <Button size="lg" asChild>
              <Link href="/booking">Request Custom Order</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
