"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Booking", href: "/booking" },
  { name: "Redeem", href: "/redeem" },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setIsAdmin(profile?.role === "admin")
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === "admin")
          })
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-gradient-to-r from-secondary/60 via-background/85 to-accent/45 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Sparkles" width={32} height={32} priority />
          <span className="text-xl font-bold tracking-tight">Sparkles</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 pt-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Image src="/images/logo.png" alt="Sparkles" width={32} height={32} priority />
                <span className="text-xl font-bold">Sparkles</span>
              </Link>

              <nav className="flex flex-col gap-4 px-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant={pathname === item.href ? "default" : "outline"}
                    size="default"
                    className="border-[9px] border-transparent hover:border-primary/20 text-center justify-center text-sm"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pt-4 border-t">
                {isAdmin && (
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link href="/admin">Admin Panel</Link>
                  </Button>
                )}
                {user ? (
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link href="/account">
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </Button>
                ) : (
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
