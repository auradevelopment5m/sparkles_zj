import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Sparkles | Hand-Painted Canvas Art",
  description:
    "Discover unique hand-painted canvas art by Zahraa Jaffal. Custom orders available. Transform your space with original artwork.",
  keywords: ["art", "canvas", "paintings", "custom art", "hand-painted", "Zahraa Jaffal", "Sparkles", "Sparkes"],
  authors: [{ name: "Zahraa Jaffal" }],
  openGraph: {
    title: "Sparkles | Hand-Painted Canvas Art",
    description: "Discover unique hand-painted canvas art by Zahraa Jaffal",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#eef4ff",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} font-sans antialiased overflow-x-hidden`}>
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
