import { Suspense } from "react"
import Link from "next/link"
import { Phone, Instagram, Sparkles, Gift, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PaintSplatter } from "@/components/ui/paint-splatter"
import { BookingForm } from "@/components/booking/booking-form"
import { createClient } from "@/lib/supabase/server"

async function getCustomizationOptions() {
  const supabase = await createClient()
  const { data } = await supabase.from("customization_options").select("*").eq("is_active", true).order("sort_order")
  return data || []
}

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .gt("stock", 0)
    .order("name")
  return data || []
}

async function getSiteSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from("site_settings").select("*").single()
  return data
}

export default async function BookingPage() {
  const [options, products, settings] = await Promise.all([getCustomizationOptions(), getProducts(), getSiteSettings()])

  const sizeOptions = options.filter((o) => o.type === "size")
  const materialOptions = options.filter((o) => o.type === "material")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <PaintSplatter variant="section" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Your Canvas</h1>
              <p className="text-lg text-muted-foreground">
                Choose from our collection or create something completely unique
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Suspense fallback={<div>Loading form...</div>}>
                  <BookingForm products={products} sizeOptions={sizeOptions} materialOptions={materialOptions} />
                </Suspense>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Us</CardTitle>
                    <CardDescription>Have questions? Reach out directly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <a
                      href={`https://instagram.com/${settings?.instagram || "sparkles_zj"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">@{settings?.instagram || "sparkles_zj"}</p>
                        <p className="text-xs text-muted-foreground">Follow us on Instagram</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                {/* Sign Up Prompt */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Member Benefits</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Sign up for an account to unlock these perks:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        Earn points on every purchase
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Chat directly with Zahraa
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Track your order status
                      </li>
                    </ul>
                    <Button className="w-full mt-4" asChild>
                      <Link href="/auth/register?redirect=/booking">Create Account</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Process Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 text-sm">
                      {[
                        { step: "1", title: "Place Order", desc: "Fill out the form with your details" },
                        { step: "2", title: "Confirmation", desc: "We'll contact you to confirm" },
                        { step: "3", title: "Creation", desc: "Your canvas is hand-painted" },
                        { step: "4", title: "Delivery", desc: "Pay on delivery, enjoy your art!" },
                      ].map((item) => (
                        <li key={item.step} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {item.step}
                          </span>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-muted-foreground">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
