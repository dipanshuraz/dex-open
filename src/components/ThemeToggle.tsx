"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="relative flex items-center justify-center h-8 w-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-2" aria-label="Toggle theme">
        <Sun className="h-4 w-4 text-orange-500 opacity-50" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-center h-8 w-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-2"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
    </button>
  )
}
