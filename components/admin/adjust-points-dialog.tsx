"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function AdjustPointsDialog({
  customerId,
  customerName,
  currentPoints,
}: {
  customerId: string
  customerName: string
  currentPoints: number
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [points, setPoints] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const newPoints = Math.max(0, currentPoints + points)
      const { error } = await supabase.from("profiles").update({ points: newPoints }).eq("id", customerId)
      if (error) throw error

      toast.success(`Points ${points >= 0 ? "added" : "removed"} successfully`)
      setIsOpen(false)
      setPoints(0)
      router.refresh()
    } catch (error) {
      toast.error("Failed to adjust points")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="mr-2 h-4 w-4" />
          Adjust
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Points</DialogTitle>
          <DialogDescription>
            Adjust points for {customerName}. Current balance: {currentPoints} pts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Points to add/remove</Label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number.parseInt(e.target.value) || 0)}
              placeholder="Enter amount (negative to remove)"
            />
            <p className="text-sm text-muted-foreground">New balance: {Math.max(0, currentPoints + points)} pts</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || points === 0}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
