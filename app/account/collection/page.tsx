import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"

async function getCollection() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("user_collections")
    .select("*, product:products(*, images:product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export default async function CollectionPage() {
  const collection = await getCollection()

  if (collection === null) {
    redirect("/auth/login?redirect=/account/collection")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>My Collection</CardTitle>
              </div>
              <CardDescription>Your purchased limited edition pieces</CardDescription>
            </CardHeader>
            <CardContent>
              {collection.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collection.map((item) => {
                    const img =
                      item.product?.images?.find((i: { is_primary: boolean }) => i.is_primary) ||
                      item.product?.images?.[0]
                    return (
                      <div key={item.id} className="group">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                          <Image
                            src={
                              img?.image_url ||
                              `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(item.product?.name || "canvas")}`
                            }
                            alt={item.product?.name || "Canvas"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute top-3 left-3 bg-primary">Limited Edition</Badge>
                        </div>
                        <h3 className="font-semibold">{item.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Your collection is empty</p>
                  <p className="text-muted-foreground mb-6">
                    Purchase limited edition canvases to add them to your collection
                  </p>
                  <Button asChild>
                    <Link href="/store">Browse Limited Editions</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
