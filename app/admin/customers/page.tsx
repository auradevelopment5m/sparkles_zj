import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { AdjustPointsDialog } from "@/components/admin/adjust-points-dialog"

async function getCustomers() {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
  return data || []
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage customer accounts and points</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {customers.length > 0 ? (
            <div className="divide-y">
              {customers.map((customer) => (
                <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {customer.first_name} {customer.last_name || ""}
                      </p>
                      {customer.role === "admin" && <Badge>Admin</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.phone || "No phone"}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{customer.points} pts</p>
                      <p className="text-xs text-muted-foreground">Points balance</p>
                    </div>
                    <AdjustPointsDialog
                      customerId={customer.id}
                      customerName={`${customer.first_name || ""} ${customer.last_name || ""}`}
                      currentPoints={customer.points}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No customers yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
