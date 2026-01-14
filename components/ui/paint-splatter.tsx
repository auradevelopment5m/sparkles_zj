"use client"

import { cn } from "@/lib/utils"

interface PaintSplatterProps {
  className?: string
  variant?: "hero" | "section" | "card"
}

export function PaintSplatter({ className, variant = "section" }: PaintSplatterProps) {
  const variants = {
    hero: "opacity-20",
    section: "opacity-10",
    card: "opacity-5",
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", variants[variant], className)}
      aria-hidden="true"
    >
      {/* Coral splatter */}
      <div
        className="absolute -top-20 -left-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "var(--coral)" }}
      />
      {/* Teal splatter */}
      <div
        className="absolute top-1/4 -right-10 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "var(--teal)" }}
      />
      {/* Gold splatter */}
      <div
        className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full blur-3xl"
        style={{ background: "var(--gold)" }}
      />
      {/* Lavender splatter */}
      <div
        className="absolute -bottom-10 right-1/4 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "var(--lavender)" }}
      />
    </div>
  )
}
