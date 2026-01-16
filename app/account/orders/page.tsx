import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"

async function getOrders() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Not Processed Yet",
  ongoing: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export default async function OrdersPage() {
  const orders = await getOrders()

  if (orders === null) {
    redirect("/auth/login?redirect=/account/orders")
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
              <CardTitle>My Orders</CardTitle>
              <CardDescription>View and track all your orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {order.is_custom
                              ? "Custom Order"
                              : order.items?.[0]?.product?.name || `Order #${order.id.slice(0, 8)}`}
                          </p>
                          {order.is_custom && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                          {order.items?.some(item => item.product?.customization_fields?.length > 0) && !order.is_custom && (
                            <Badge variant="outline" className="text-xs">
                              Mockup
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-primary">${order.total_amount}</span>
                          {order.points_earned > 0 && (
                            <span className="text-muted-foreground">+{order.points_earned} points earned</span>
                          )}
                        </div>
                      </div>
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet</p>
                  <Button asChild>
                    <Link href="/store">Start Shopping</Link>
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
