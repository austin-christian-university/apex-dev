"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-8 w-14 rounded-full border-2 bg-background transition-colors hover:bg-muted"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <div className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-primary transition-transform dark:translate-x-6">
        <Sun className="absolute left-1 top-1 h-4 w-4 rotate-0 scale-100 text-primary-foreground transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute left-1 top-1 h-4 w-4 rotate-90 scale-0 text-primary-foreground transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
