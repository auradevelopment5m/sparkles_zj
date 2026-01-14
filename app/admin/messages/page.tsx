import { createClient } from "@/lib/supabase/server"
import { AdminMessagesClient } from "@/components/admin/admin-messages-client"

async function getConversations() {
  const supabase = await createClient()

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false })

  if (error || !conversations || conversations.length === 0) return []

  const customerIds = Array.from(new Set(conversations.map((c) => c.customer_id).filter(Boolean)))
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", customerIds)

  const profileById = new Map((profiles || []).map((p) => [p.id, p]))

  return conversations.map((c) => ({
    ...c,
    customer: profileById.get(c.customer_id) ?? null,
  }))
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string | string[] }> | { user?: string | string[] }
}) {
  const conversations = await getConversations()

  const resolvedSearchParams = await searchParams
  const userParam = resolvedSearchParams?.user
  const initialSelectedCustomerId = Array.isArray(userParam) ? userParam[0] : userParam

  return <AdminMessagesClient conversations={conversations} initialSelectedCustomerId={initialSelectedCustomerId} />
}
