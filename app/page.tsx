import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Palette, Sparkles, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PaintSplatter } from "@/components/ui/paint-splatter"
import { createClient } from "@/lib/supabase/server"

async function getFeaturedProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(4)
  return data || []
}

async function getFeaturedGallery() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("featured_gallery")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .limit(6)
  return data || []
}

async function getSiteSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from("site_settings").select("*").single()
  return data
}

export default async function HomePage() {
  const [featuredProducts, gallery, settings] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedGallery(),
    getSiteSettings(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <PaintSplatter variant="hero" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Hand-Painted with Love
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                  Where Every Canvas Tells a <span className="text-primary">Unique Story</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                  {settings?.about_text ||
                    "Discover unique hand-painted canvas art created with passion and creativity. Each piece is carefully crafted to bring beauty and inspiration to your space."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/store">
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-accent text-primary-foreground border-transparent hover:bg-accent/90 hover:text-primary-foreground"
                    asChild
                  >
                    <Link href="/booking">Custom Order</Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform rotate-2">
                      <Image src="/colorful-abstract-canvas-art-painting.jpg" alt="Abstract canvas art" fill className="object-cover" />
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl transform -rotate-2">
                      <Image src="/floral-painting-canvas-art.jpg" alt="Floral canvas art" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl transform rotate-3">
                      <Image src="/sunset-landscape-painting.png" alt="Sunset landscape" fill className="object-cover" />
                    </div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform -rotate-1">
                      <Image src="/modern-art-canvas-painting-vibrant.jpg" alt="Modern canvas art" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Palette, title: "Hand-Painted", desc: "Every piece is uniquely crafted by hand" },
                { icon: Heart, title: "Made with Love", desc: "Passion poured into every brushstroke" },
                { icon: Sparkles, title: "Custom Orders", desc: "Your vision brought to life on canvas" },
                { icon: Star, title: "Earn Points", desc: "Collect points with every purchase" },
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-none bg-transparent">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About the Founder */}
        <section className="py-20 relative overflow-hidden">
          <PaintSplatter variant="section" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/portfolioimage.jpeg"
                    alt={settings?.founder_name || "Zahraa Jaffal"}
                    fill
                    className="object-fill"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl">
                  <p className="text-3xl font-bold">2+</p>
                  <p className="text-sm">Years of Art</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-balance">Meet the Artist Behind Sparkles</h2>
                <p className="text-lg text-muted-foreground">
                  Hi, I&apos;m <strong>{settings?.founder_name || "Zahraa Jaffal"}</strong>, the founder and artist
                  behind Sparkles. My journey with art began as a way to express emotions that words couldn&apos;t
                  capture.
                </p>
                <p className="text-muted-foreground">
                  Every canvas I create is a piece of my heart. I believe that art has the power to transform spaces and
                  touch souls. Whether you choose a piece from my collection or commission a custom work, you&apos;re
                  taking home a unique creation made just for you.
                </p>
                <Button asChild>
                  <Link href="/booking">
                    Commission Your Art
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Gallery */}
        {gallery.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Gallery</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  A glimpse into our collection of hand-painted masterpieces
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item, i) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-2xl shadow-lg group bg-background/40 flex items-center justify-center"
                    style={{ width: '320px', height: '240px', margin: '0 auto' }}
                  >
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title || "Gallery artwork"}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-background font-semibold text-lg">{item.title}</h3>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Collection</h2>
                  <p className="text-muted-foreground">Explore our most loved pieces</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/store">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => {
                  const primaryImage =
                    product.images?.find((img: { is_primary: boolean }) => img.is_primary) || product.images?.[0]
                  return (
                    <Card key={product.id} className="group overflow-hidden">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={
                            primaryImage?.image_url ||
                            `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`
                          }
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.is_limited && (
                          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
                            Limited
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">${product.price}</p>
                          <p className="text-xs text-muted-foreground">+{product.points_value} pts</p>
                        </div>
                        <Button className="w-full mt-3" size="sm" asChild>
                          <Link href={`/store/${product.id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl bg-accent/80" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full blur-3xl bg-background/80" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to Own a Unique Piece of Art?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Browse our collection or tell us about your dream canvas. Every order earns you points toward free
              rewards!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/store">Shop Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/booking">Request Custom</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
