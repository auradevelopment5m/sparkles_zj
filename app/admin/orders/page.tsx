import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

async function getOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, customization_fields:product_customization_fields(*)),
        customization_values:product_customization_values(*, field:product_customization_fields(*))
      ),
      custom_order:custom_orders(*)
    `)
    .order("created_at", { ascending: false })
  return data || []
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <div className="divide-y">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {order.first_name} {order.last_name}
                      </p>
                      {order.is_custom && <Badge variant="outline">Custom</Badge>}
                      {order.items?.some(item => item.product?.customization_fields?.length > 0) && !order.is_custom && <Badge variant="outline">Mockup</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.is_custom
                        ? "Custom Order"
                        : order.items?.[0]?.product?.name || "Order"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} • {order.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge>
                    <span className="font-semibold text-primary">${order.total_amount}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
