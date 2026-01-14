import Link from "next/link"
import { Package, ShoppingCart, Users, TrendingUp, MessageCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

async function getDashboardData() {
  const supabase = await createClient()

  const [productsResult, ordersResult, customersResult, recentOrdersResult, unreadMessagesResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact" }),
    supabase.from("orders").select("id, total_amount, status", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase
      .from("orders")
      .select("*, items:order_items(product:products(name))")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("messages").select("id", { count: "exact" }).eq("is_read", false).eq("sender_role", "customer"),
  ])

  const pendingOrders = ordersResult.data?.filter((o) => o.status === "pending").length || 0
  const totalRevenue =
    ordersResult.data?.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  return {
    totalProducts: productsResult.count || 0,
    totalOrders: ordersResult.count || 0,
    pendingOrders,
    totalCustomers: customersResult.count || 0,
    totalRevenue,
    recentOrders: recentOrdersResult.data || [],
    unreadMessages: unreadMessagesResult.count || 0,
  }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      {/* Alerts */}
      {(data.pendingOrders > 0 || data.unreadMessages > 0) && (
        <div className="mb-6 space-y-2">
          {data.pendingOrders > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                You have <strong>{data.pendingOrders}</strong> pending orders waiting to be processed.
              </p>
              <Button size="sm" variant="outline" className="ml-auto bg-transparent" asChild>
                <Link href="/admin/orders?status=pending">View Orders</Link>
              </Button>
            </div>
          )}
          {data.unreadMessages > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                You have <strong>{data.unreadMessages}</strong> unread messages from customers.
              </p>
              <Button size="sm" variant="outline" className="ml-auto bg-transparent" asChild>
                <Link href="/admin/messages">View Messages</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold">{data.totalProducts}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{data.totalOrders}</p>
                {data.pendingOrders > 0 && <p className="text-xs text-yellow-600">{data.pendingOrders} pending</p>}
              </div>
              <div className="rounded-full bg-accent/10 p-3">
                <ShoppingCart className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-3xl font-bold">{data.totalCustomers}</p>
              </div>
              <div className="rounded-full bg-chart-3/10 p-3">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">${data.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.is_custom ? "Custom Order" : order.items?.[0]?.product?.name || "Order"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge>
                    <p className="text-sm font-medium mt-1">${order.total_amount}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
