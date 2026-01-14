"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ImageIcon,
  Settings,
  MessageCircle,
  Gift,
  Menu,
  LogOut,
  Sparkles,
  PaintBucket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Featured Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Customization", href: "/admin/customization", icon: PaintBucket },
  { name: "Redeemables", href: "/admin/redeemables", icon: Gift },
  { name: "Messages", href: "/admin/messages", icon: MessageCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Logged out")
    router.push("/")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <span className="text-lg font-bold">Sparkles</span>
            <span className="block text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
          <Link href="/" onClick={onClose}>
            <Sparkles className="mr-2 h-4 w-4" />
            View Site
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-card">
        <NavContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b bg-background">
        <Link href="/admin" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin</span>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin menu</SheetTitle>
            </SheetHeader>
            <NavContent onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
