import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"

async function getOrder(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { redirect: true }

  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*, images:product_images(*))), custom_order:custom_orders(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  return { order: data }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ongoing: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  pending: "Not Processed Yet",
  ongoing: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusDescriptions = {
  pending: "Your order has been received and is waiting to be processed.",
  ongoing: "Your canvas is being created with care and attention to detail.",
  completed: "Your order has been completed and delivered!",
  cancelled: "This order has been cancelled.",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOrder(id)

  if ("redirect" in result && result.redirect) {
    redirect("/auth/login?redirect=/account/orders")
  }

  if (!result.order) {
    notFound()
  }

  const order = result.order

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-sm px-4 py-2`}>
              {statusLabels[order.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          {/* Status Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-3 ${order.status === "completed" ? "bg-green-100" : order.status === "ongoing" ? "bg-blue-100" : "bg-yellow-100"}`}
                >
                  <Clock
                    className={`h-6 w-6 ${order.status === "completed" ? "text-green-600" : order.status === "ongoing" ? "text-blue-600" : "text-yellow-600"}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{statusLabels[order.status as keyof typeof statusLabels]}</h3>
                  <p className="text-muted-foreground">
                    {statusDescriptions[order.status as keyof typeof statusDescriptions]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.is_custom && order.custom_order ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="mb-3">
                          Custom Order
                        </Badge>
                        <p className="font-medium mb-2">Description:</p>
                        <p className="text-muted-foreground mb-4">{order.custom_order.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {order.custom_order.size_option && (
                            <Badge variant="secondary">{order.custom_order.size_option}</Badge>
                          )}
                          {order.custom_order.material_option && (
                            <Badge variant="secondary">{order.custom_order.material_option}</Badge>
                          )}
                        </div>
                        {order.custom_order.reference_images?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Reference Images:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {order.custom_order.reference_images.map((url: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                  <Image
                                    src={url || "/placeholder.svg"}
                                    alt={`Reference ${i + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {order.items?.map(
                        (item: {
                          id: string
                          product: { name: string; images: { is_primary: boolean; image_url: string }[] }
                          size_option: string
                          material_option: string
                          price: number
                        }) => {
                          const img =
                            item.product?.images?.find((i: { is_primary: boolean }) => i.is_primary) ||
                            item.product?.images?.[0]
                          return (
                            <div key={item.id} className="flex gap-4">
                              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={
                                    img?.image_url ||
                                    `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.product?.name || "canvas")}`
                                  }
                                  alt={item.product?.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name || "Product"}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.size_option && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.size_option}
                                    </Badge>
                                  )}
                                  {item.material_option && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.material_option}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-primary font-semibold mt-2">${item.price}</p>
                              </div>
                            </div>
                          )
                        },
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>Cash on Delivery</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${order.total_amount}</span>
                    </div>
                    {order.points_earned > 0 && (
                      <p className="text-xs text-muted-foreground text-right">+{order.points_earned} points earned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{order.phone}</p>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Need help with your order?</p>
                  <Button className="w-full" asChild>
                    <Link href="/account/chat">Chat with Zahraa</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
