"use client"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { SignOutBtn } from "@/components/signout-btn"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Home } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resume Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdminPage ? (
            <Link href="/">
              <Button variant="outline" size="icon" title="Go to Home">
                <Home className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
          ) : (
            <Link href="/admin">
              <Button variant="outline" size="icon" title="Admin Panel">
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
          )}
          <ThemeToggle />
          <SignOutBtn />
        </div>
      </div>
    </header>
  )
}
