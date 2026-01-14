"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { SiteSettings } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("site_settings").select("*").single()
    setSettings(data)
    setIsLoading(false)
  }

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          instagram: settings.instagram,
          about_text: settings.about_text,
          founder_name: settings.founder_name,
        })
        .eq("id", settings.id)

      if (error) throw error
      toast.success("Settings saved")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const addAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Please enter an email")
      return
    }

    setIsAddingAdmin(true)
    const supabase = createClient()

    try {
      // Find user by checking auth (this is a simplified version)
      // In production, you'd want to search by email properly
      const { data: profiles } = await supabase.from("profiles").select("id").limit(100)

      // For now, we'll just show a message about manual process
      toast.info(
        "To add an admin, the user must first create an account. Then you can update their role in the database.",
      )
      setIsDialogOpen(false)
      setNewAdminEmail("")
    } catch (error) {
      toast.error("Failed to add admin")
    } finally {
      setIsAddingAdmin(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage site settings and admins</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Update your contact details shown on the site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram Handle</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  className="rounded-l-none"
                  value={settings?.instagram || ""}
                  onChange={(e) => setSettings(settings ? { ...settings, instagram: e.target.value } : null)}
                  placeholder="sparkles_zj"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
            <CardDescription>Update the about text shown on homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Founder Name</Label>
              <Input
                value={settings?.founder_name || ""}
                onChange={(e) => setSettings(settings ? { ...settings, founder_name: e.target.value } : null)}
                placeholder="Zahraa Jaffal"
              />
            </div>
            <div className="space-y-2">
              <Label>About Text</Label>
              <Textarea
                value={settings?.about_text || ""}
                onChange={(e) => setSettings(settings ? { ...settings, about_text: e.target.value } : null)}
                placeholder="Welcome to Sparkles..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>Manage who has admin access</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Admin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>User Email</Label>
                      <Input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                      <p className="text-xs text-muted-foreground">The user must have an existing account</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addAdmin} disabled={isAddingAdmin}>
                      {isAddingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Admin"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">ahmad23slieman@gmail.com</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
