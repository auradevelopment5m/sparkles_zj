"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const statuses = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "ongoing", label: "In Progress", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
]

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  userId,
  pointsEarned,
}: {
  orderId: string
  currentStatus: string
  userId: string | null
  pointsEarned: number
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return

    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
      if (error) throw error

      // If completed and user exists, add points
      if (status === "completed" && userId && pointsEarned > 0) {
        const { data: profile } = await supabase.from("profiles").select("points").eq("id", userId).single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({ points: profile.points + pointsEarned })
            .eq("id", userId)
        }
      }

      toast.success("Order status updated")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update status")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${s.color}`} />
                {s.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={isUpdating || status === currentStatus}>
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
    </div>
  )
}
