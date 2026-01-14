"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/account/profile")
        return
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(data)
      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
        })
        .eq("id", profile.id)

      if (error) throw error
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ""}
                      onChange={(e) => setProfile(profile ? { ...profile, first_name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ""}
                      onChange={(e) => setProfile(profile ? { ...profile, last_name: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone || ""}
                    onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Default Address</Label>
                  <Textarea
                    id="address"
                    value={profile?.address || ""}
                    onChange={(e) => setProfile(profile ? { ...profile, address: e.target.value } : null)}
                    placeholder="Your delivery address..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
