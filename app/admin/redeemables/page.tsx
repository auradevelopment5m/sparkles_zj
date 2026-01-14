import Link from "next/link"
import Image from "next/image"
import { Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { DeleteRedeemableButton } from "@/components/admin/delete-redeemable-button"

async function getRedeemables() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("redeemable_items")
    .select("*, images:redeemable_images(*)")
    .order("created_at", { ascending: false })
  return data || []
}

export default async function AdminRedeemablesPage() {
  const redeemables = await getRedeemables()

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Redeemable Items</h1>
          <p className="text-muted-foreground">Manage point rewards</p>
        </div>
        <Button asChild>
          <Link href="/admin/redeemables/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Redeemable
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {redeemables.length > 0 ? (
            <div className="divide-y">
              {redeemables.map((item) => {
                const img = item.images?.find((i: { is_primary: boolean }) => i.is_primary) || item.images?.[0]
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={
                          img?.image_url || `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(item.name)}`
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.name}</p>
                        {!item.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">{item.points_required} pts</span>
                        <span>Stock: {item.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/redeemables/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteRedeemableButton itemId={item.id} itemName={item.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No redeemable items yet</p>
              <Button asChild>
                <Link href="/admin/redeemables/new">Add Your First Reward</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
