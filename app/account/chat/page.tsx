import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatInterface } from "@/components/chat/chat-interface"
import { createClient } from "@/lib/supabase/server"

async function getChatData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get or create conversation
  const { data: conversation } = await supabase.from("conversations").select("*").eq("customer_id", user.id).single()

  let conversationId = conversation?.id

  if (!conversationId) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({ customer_id: user.id })
      .select()
      .single()
    conversationId = newConversation?.id
  }

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  return {
    user,
    conversationId,
    messages: messages || [],
  }
}

export default async function ChatPage() {
  const data = await getChatData()

  if (!data) {
    redirect("/auth/login?redirect=/account/chat")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col min-h-0">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>
        </div>

        <ChatInterface
          conversationId={data.conversationId}
          initialMessages={data.messages}
          currentUserId={data.user.id}
          isAdmin={false}
        />
      </main>

      <Footer />
    </div>
  )
}
