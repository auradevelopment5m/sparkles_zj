"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Gift, Sparkles, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { RedeemableItem } from "@/lib/types"

interface RedeemPageClientProps {
  items: RedeemableItem[]
  userPoints: number
  isLoggedIn: boolean
}

export function RedeemPageClient({ items, userPoints, isLoggedIn }: RedeemPageClientProps) {
  const [selectedItem, setSelectedItem] = useState<RedeemableItem | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [points, setPoints] = useState(userPoints)
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const handleRedeem = async () => {
    if (!selectedItem) return
    if (!address || !phone) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsRedeeming(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please sign in to redeem")
        return
      }

      // Check points again
      const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single()

      if (!profile || profile.points < selectedItem.points_required) {
        toast.error("Not enough points")
        return
      }

      // Deduct points
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ points: profile.points - selectedItem.points_required })
        .eq("id", user.id)

      if (pointsError) throw pointsError

      // Reduce stock
      const { error: stockError } = await supabase
        .from("redeemable_items")
        .update({ stock: selectedItem.stock - 1 })
        .eq("id", selectedItem.id)

      if (stockError) throw stockError

      // Create redemption record
      const { error: redemptionError } = await supabase.from("redemptions").insert({
        user_id: user.id,
        redeemable_id: selectedItem.id,
        points_spent: selectedItem.points_required,
        first_name: "Points",
        last_name: "Redemption",
        phone,
        address,
      })

      if (redemptionError) throw redemptionError

      // Update local state
      setPoints(profile.points - selectedItem.points_required)
      toast.success("Successfully redeemed! We'll contact you about delivery.")
      setSelectedItem(null)
      setAddress("")
      setPhone("")
      setNotes("")
    } catch (error) {
      toast.error("Failed to redeem item")
      console.error(error)
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-violet-500/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">Rewards Program</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Redeem Your <span className="text-primary">Points</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Turn your points into exclusive limited edition canvases. Each piece is unique and only available through
              our rewards program.
            </p>
            {isLoggedIn ? (
              <div className="inline-flex items-center gap-3 bg-card border rounded-full px-6 py-3">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold">{points}</span>
                <span className="text-muted-foreground">points available</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Sign in to view your points and redeem rewards</p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/auth/register">Create Account</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Available Rewards</h2>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
                <p className="text-muted-foreground">Check back soon for exclusive redeemable items!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const canAfford = isLoggedIn && points >= item.points_required

                return (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <Image
                        src={
                          item.image_url ||
                          `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name) || "/placeholder.svg"}`
                        }
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-accent text-accent-foreground border border-border/60">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {item.points_required} pts
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.stock} left</span>
                        <Button
                          size="sm"
                          disabled={!isLoggedIn || !canAfford}
                          onClick={() => isLoggedIn && canAfford && setSelectedItem(item)}
                        >
                          {!isLoggedIn ? "Sign In" : canAfford ? "Redeem" : "Not Enough Points"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">How Points Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Earn Points</h3>
              <p className="text-sm text-muted-foreground">
                Every canvas you purchase earns you points based on its value
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Collect Points</h3>
              <p className="text-sm text-muted-foreground">Points accumulate in your account and never expire</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Redeem Rewards</h3>
              <p className="text-sm text-muted-foreground">Exchange points for exclusive limited edition canvases</p>
            </div>
          </div>
        </div>
      </section>

      {/* Redeem Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              This will deduct {selectedItem?.points_required} points from your account. Please provide your delivery
              details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
              <span>Points after redemption:</span>
              <span className="font-bold text-lg">{points - (selectedItem?.points_required || 0)}</span>
            </div>
            <div className="space-y-2">
              <Label>Delivery Address *</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your full delivery address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+224 666 70 59 65" />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={isRedeeming}>
              {isRedeeming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Confirm Redemption
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
