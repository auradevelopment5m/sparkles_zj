import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"

async function getOrder(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      `*, 
       items:order_items(
         *,
         product:products(*, images:product_images(*), customization_fields:product_customization_fields(*)),
         customization_values:product_customization_values(*, field:product_customization_fields(*))
       ),
       custom_order:custom_orders(*)`,
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    return null
  }
  return data
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const customOrder = Array.isArray(order.custom_order) ? order.custom_order[0] : order.custom_order

  let refProduct: any = null
  let refProductImg: any = null
  if (customOrder?.reference_product) {
    refProduct = order.items?.find((item: any) => item.product?.id === customOrder.reference_product)?.product
    if (!refProduct) {
      const supabase = await createClient()
      const { data } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("id", customOrder.reference_product)
        .single()
      refProduct = data
    }
    refProductImg = refProduct?.images?.find((i: any) => i.is_primary) || refProduct?.images?.[0]
  }

  return (
    <div className="p-4 lg:p-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={order.status}
          userId={order.user_id}
          pointsEarned={order.points_earned}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {order.is_custom && customOrder ? (
                <div className="space-y-4">
                  <Badge variant="outline">Custom Order</Badge>
                  <p className="font-medium">Description:</p>
                  <p className="text-muted-foreground">{customOrder.description}</p>
                  {customOrder.reference_product && refProduct && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                        <Image src={refProductImg?.image_url || "/placeholder.svg"} alt={refProduct.name} fill className="object-cover" />
                      </span>
                      <span className="font-medium">Reference: {refProduct.name}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {customOrder.size_option && (
                      <Badge variant="secondary">{customOrder.size_option}</Badge>
                    )}
                    {customOrder.material_option && (
                      <Badge variant="secondary">{customOrder.material_option}</Badge>
                    )}
                  </div>
                  {customOrder.reference_images?.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Reference Images:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {customOrder.reference_images.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-lg overflow-hidden"
                          >
                            <Image src={url || "/placeholder.svg"} alt={`Reference ${i + 1}`} fill className="object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {order.items?.map(
                    (item: {
                      id: string
                      product: { name: string; images: { is_primary: boolean; image_url: string }[]; customization_fields?: any[] }
                      size_option: string
                      material_option: string
                      price: number
                      customization_values?: any[]
                    }) => {
                      const img =
                        item.product?.images?.find((i: { is_primary: boolean }) => i.is_primary) ||
                        item.product?.images?.[0]
                      return (
                        <div key={item.id} className="space-y-3">
                          <div className="flex gap-4">
                            <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={img?.image_url || `/placeholder.svg?height=80&width=80`}
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product?.name}</p>
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
                          {item.customization_values && item.customization_values.length > 0 && (
                            <div className="ml-24 space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Customizations:</p>
                              <div className="space-y-1">
                                {item.customization_values.map((value: any) => (
                                  <div key={value.id} className="text-sm">
                                    <span className="font-medium">{value.field?.field_label}:</span>{" "}
                                    <span>{value.field_value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    },
                  )}
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">${order.total_amount}</span>
              </div>
              {order.points_earned > 0 && (
                <p className="text-xs text-muted-foreground text-right">+{order.points_earned} points to customer</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {order.first_name} {order.last_name}
                  </p>
                  {order.user_id && <p className="text-xs text-muted-foreground">Registered user</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${order.phone}`} className="text-sm hover:text-primary">
                  {order.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm">{order.address}</p>
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

          {order.user_id && (
            <Card>
              <CardContent className="p-4">
                <Button className="w-full" asChild>
                  <Link href={`/admin/messages?user=${order.user_id}`}>Message Customer</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
