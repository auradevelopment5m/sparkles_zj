import Link from "next/link"
import { CheckCircle, ArrowRight, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Thank you for your order! We&apos;ll contact you soon to confirm the details and arrange delivery.
            </p>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <p className="font-medium text-sm">Don&apos;t miss out on rewards!</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create an account to earn points on this order and track your delivery status.
                </p>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/auth/register">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/">Go Home</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/store">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
