"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Sparkles, ArrowLeft, Gift, MessageCircle, Star } from "lucide-react"
import { toast } from "sonner"

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${redirect}`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      })
      if (error) throw error
      toast.success("Account created! Please check your email to verify your account.")
      router.push("/auth/verify")
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
                <span className="text-2xl font-bold">Sparkles</span>
              </Link>
              <h2 className="text-3xl font-bold mb-4">Join our Art Community</h2>
              <p className="text-muted-foreground">
                Create an account to unlock exclusive benefits and track your orders.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Star, title: "Earn Points", desc: "Get points with every purchase to redeem for rewards" },
                { icon: MessageCircle, title: "Direct Chat", desc: "Chat directly with Zahraa about your orders" },
                { icon: Gift, title: "Exclusive Access", desc: "Be first to know about limited edition drops" },
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Sparkles</span>
              </div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Sign up to start your art journey with us</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+224 600 00 00 00"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href={`/auth/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
