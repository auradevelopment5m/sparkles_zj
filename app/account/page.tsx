import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, MessageCircle, Star, Gift, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import { LogoutButton } from "@/components/account/logout-button"

async function getAccountData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [profileResult, ordersResult, collectionsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*)), custom_order:custom_orders(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_collections")
      .select("*, product:products(*, images:product_images(*))")
      .eq("user_id", user.id)
      .limit(4),
  ])

  return {
    user,
    profile: profileResult.data,
    orders: ordersResult.data || [],
    collections: collectionsResult.data || [],
  }
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

export default async function AccountPage() {
  const data = await getAccountData()

  if (!data) {
    redirect("/auth/login?redirect=/account")
  }

  const { user, profile, orders, collections } = data

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.first_name || user.email?.split("@")[0]}!</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <LogoutButton />
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile?.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Points Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-accent/10 p-3">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-chart-3/10 p-3">
                    <Gift className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{collections.length}</p>
                    <p className="text-sm text-muted-foreground">In Collection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <Link href="/account/chat" className="flex items-center gap-4">
                  <div className="rounded-full bg-primary-foreground/20 p-3">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Chat with Zahraa</p>
                    <p className="text-sm opacity-80">Direct messaging</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Track your order status</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/account/orders">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/account/orders/${order.id}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {order.is_custom
                                ? "Custom Order"
                                : order.items?.[0]?.product?.name || `Order #${order.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} • ${order.total_amount}
                            </p>
                          </div>
                          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button asChild>
                        <Link href="/store">Start Shopping</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/account/collection">
                      <Gift className="mr-2 h-4 w-4" />
                      My Collection
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/redeem">
                      <Star className="mr-2 h-4 w-4" />
                      Redeem Points
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/account/chat">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Zahraa
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/account/profile">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Edit Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Points Card */}
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="h-8 w-8" />
                    <span className="text-xs opacity-80">Sparkles Rewards</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{profile?.points || 0}</p>
                  <p className="text-sm opacity-80 mb-4">Available Points</p>
                  <Button size="sm" variant="secondary" className="w-full" asChild>
                    <Link href="/redeem">Redeem Rewards</Link>
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
