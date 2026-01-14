import Link from "next/link"
import { Sparkles, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-muted/55 via-background/80 to-secondary/55">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Sparkles</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hand-painted canvas art created with passion by Zahraa Jaffal. Each piece tells a unique story.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Store
              </Link>
              <Link href="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Custom Order
              </Link>
              <Link href="/redeem" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Redeem Points
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="font-semibold">Account</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Create Account
              </Link>
              <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                My Orders
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://instagram.com/sparkles_zj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @sparkles_zj
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sparkles by Zahraa Jaffal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
