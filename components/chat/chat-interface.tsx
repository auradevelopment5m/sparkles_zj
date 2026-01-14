"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, ImagePlus, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string
  isAdmin: boolean
  customerName?: string
}

export function ChatInterface({
  conversationId,
  initialMessages,
  currentUserId,
  isAdmin,
  customerName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomAnchorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom on new messages
    bottomAnchorRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return

    setIsSending(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_role: isAdmin ? "admin" : "customer",
        content: content.trim() || null,
        image_url: imageUrl || null,
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(newMessage)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file")
      }

      // 10MB safety cap to avoid huge uploads
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image is too large (max 10MB)")
      }

      const extFromName = file.name.includes(".") ? file.name.split(".").pop() : ""
      const extFromMime = file.type.split("/")[1] || ""
      const fileExt = (extFromName || extFromMime || "png").toLowerCase()
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const filePath = `${conversationId}/${id}.${fileExt}`

      const { error } = await supabase.storage.from("chat-images").upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

      if (error) throw error

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(filePath)
      if (!urlData.publicUrl) {
        throw new Error("Could not generate image URL")
      }

      await sendMessage("", urlData.publicUrl)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card className="flex-1 flex flex-col mx-0 sm:mx-4 lg:mx-8 mb-4 h-full min-h-0">
      <CardHeader className="border-b py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{isAdmin ? customerName || "Customer" : "Chat with Zahraa"}</CardTitle>
            <p className="text-sm text-muted-foreground">{isAdmin ? "Customer support" : "Ask about your orders"}</p>
          </div>
        </div>
      </CardHeader>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isAdmin ? "No messages yet" : "Start a conversation with Zahraa about your orders!"}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 break-words",
                      isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
                    )}
                  >
                    {message.image_url && (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-2">
                        <img
                          src={message.image_url}
                          alt="Shared image"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                    <p className={cn("text-xs mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div ref={bottomAnchorRef} />
      </div>

      <CardContent className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isSending || (!newMessage.trim() && !isUploading)}>
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
