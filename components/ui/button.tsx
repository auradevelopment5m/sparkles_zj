import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-sm font-medium tracking-tight transition-all disabled:pointer-events-none disabled:opacity-50 active:translate-y-px overflow-hidden ring-1 ring-primary/15 hover:ring-primary/25 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-accent',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:brightness-95 hover:shadow-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border-border/60 bg-card shadow-xs backdrop-blur-md hover:shadow-sm hover:bg-accent/25 hover:border-border',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-accent/25',
        ghost:
          'hover:bg-accent/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-xl px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
