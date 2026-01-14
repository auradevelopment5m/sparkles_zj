"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageCircle, User, Loader2, ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/chat/chat-interface"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Conversation, Profile, Message } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

interface AdminMessagesClientProps {
  conversations: (Conversation & { customer: Profile | null })[]
  initialSelectedCustomerId?: string
}

export function AdminMessagesClient({ conversations, initialSelectedCustomerId }: AdminMessagesClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const isMobile = useIsMobile()
  const [adminUserId, setAdminUserId] = useState<string | null>(null)
  const [conversationList, setConversationList] = useState<(Conversation & { customer: Profile | null })[]>(conversations)
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { customer: Profile | null }) | null>(
    null,
  )
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminUserId(data.user?.id ?? null)
    })
  }, [supabase])

  useEffect(() => {
    if (!initialSelectedCustomerId) return
    const match = conversationList.find((c) => c.customer_id === initialSelectedCustomerId)
    if (match) setSelectedConversation(match)
  }, [initialSelectedCustomerId, conversationList])

  useEffect(() => {
    if (!isMobile) return
    setMobileView(selectedConversation ? "chat" : "list")
  }, [isMobile, selectedConversation])

  useEffect(() => {
    setConversationList(conversations)
  }, [conversations])

  useEffect(() => {
    const load = async () => {
      if (!selectedConversation) return
      setIsLoadingMessages(true)
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", selectedConversation.id)
          .order("created_at", { ascending: true })

        if (error) throw error
        setSelectedMessages((data as Message[]) || [])

        // Mark customer messages as read when admin opens the thread
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", selectedConversation.id)
          .eq("sender_role", "customer")
          .eq("is_read", false)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    load()
  }, [selectedConversation, supabase])

  const getCustomerName = (conv: Conversation & { customer: Profile | null }) =>
    conv.customer?.full_name || `${conv.customer?.first_name || ""} ${conv.customer?.last_name || ""}`.trim() || "Customer"

  const openConversation = (conv: Conversation & { customer: Profile | null }) => {
    setSelectedConversation(conv)
    if (isMobile) setMobileView("chat")
  }

  const MobileBackBar = () => {
    if (!selectedConversation) return null
    return (
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60"
          aria-label="Back to conversations"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="min-w-0">
          <p className="font-medium truncate">{getCustomerName(selectedConversation)}</p>
          <p className="text-xs text-muted-foreground truncate">Customer conversation</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!selectedConversation) return

    const channel = supabase
      .channel(`admin:messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          setSelectedMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // Keep the conversation list feeling "live" by bubbling the active conversation.
          setConversationList((prev) => {
            const updated = prev.map((c) => (c.id === selectedConversation.id ? { ...c, last_message_at: newMsg.created_at } : c))
            updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
            return updated
          })

          if (newMsg.sender_role === "customer") {
            await supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, supabase])

  return (
    <div className="p-4 lg:p-8 min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your customers</p>
      </div>

      {/* Mobile: single-pane (list <-> chat). Desktop: split-pane. */}
      {isMobile ? (
        <div className="min-w-0">
          {mobileView === "list" ? (
            <Card className="overflow-hidden bg-white/60">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {conversationList.length > 0 ? (
                  <div className="divide-y">
                    {conversationList.map((conv) => {
                      const unreadCount = 0
                      const customerName = getCustomerName(conv)

                      return (
                        <button
                          key={conv.id}
                          onClick={() => openConversation(conv)}
                          className={cn(
                            "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
                            selectedConversation?.id === conv.id && "bg-muted",
                          )}
                        >
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">{customerName}</p>
                              {unreadCount > 0 && (
                                <Badge variant="default" className="ml-auto">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">Tap to open conversation</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="min-h-0">
              <MobileBackBar />
              {selectedConversation ? (
                isLoadingMessages || !adminUserId ? (
                  <Card className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading conversation…</span>
                    </div>
                  </Card>
                ) : (
                  <ChatInterface
                    key={selectedConversation.id}
                    conversationId={selectedConversation.id}
                    initialMessages={selectedMessages}
                    currentUserId={adminUserId}
                    isAdmin={true}
                    customerName={getCustomerName(selectedConversation)}
                  />
                )
              ) : (
                <Card className="h-full flex items-center justify-center bg-white/60">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a conversation to start chatting</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-0">
          {/* Conversations List */}
          <Card className="lg:col-span-1 overflow-hidden bg-white/60 min-h-0">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto h-[calc(100%-60px)]">
              {conversationList.length > 0 ? (
                <div className="divide-y">
                  {conversationList.map((conv) => {
                    const unreadCount = 0
                    const customerName = getCustomerName(conv)

                    return (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
                          selectedConversation?.id === conv.id && "bg-muted",
                        )}
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{customerName}</p>
                            {unreadCount > 0 && (
                              <Badge variant="default" className="ml-auto">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">Tap to open conversation</p>
                          <p className="text-xs text-muted-foreground">
                            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            {selectedConversation ? (
              isLoadingMessages || !adminUserId ? (
                <Card className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading conversation…</span>
                  </div>
                </Card>
              ) : (
                <ChatInterface
                  key={selectedConversation.id}
                  conversationId={selectedConversation.id}
                  initialMessages={selectedMessages}
                  currentUserId={adminUserId}
                  isAdmin={true}
                  customerName={getCustomerName(selectedConversation)}
                />
              )
            ) : (
              <Card className="h-full flex items-center justify-center bg-white/60">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
