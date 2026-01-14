import { createClient } from "@/lib/supabase/server"
import { RedeemPageClient } from "@/components/redeem/redeem-page-client"

export default async function RedeemPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from("redeemable_items")
    .select("*, images:redeemable_images(*)")
    .eq("is_active", true)
    .gt("stock", 0)
    .order("points_required", { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userPoints = 0
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single()

    userPoints = profile?.points || 0
  }

  // Transform items to include primary image URL
  const transformedItems = (items || []).map((item) => {
    const primaryImage = item.images?.find((img: { is_primary: boolean }) => img.is_primary) || item.images?.[0]
    return {
      ...item,
      image_url: primaryImage?.image_url || null,
    }
  })

  return <RedeemPageClient items={transformedItems} userPoints={userPoints} isLoggedIn={!!user} />
}
