"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
