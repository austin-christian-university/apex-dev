'use client'

import { useState } from "react"
import { Button } from "@acu-apex/ui"
import { Sheet, SheetContent, SheetTrigger } from "@acu-apex/ui"
import { Menu, Home, Users, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@acu-apex/utils"
import { useAuth } from "@/components/auth/auth-provider"
import Image from "next/image"

const navigation = [
  {
    name: "Home",
    href: "/home" as const,
    icon: Home,
    description: "Company standings & events"
  },
  {
    name: "Company",
    href: "/company" as const, 
    icon: Users,
    description: "Team overview & achievements"
  },
  {
    name: "Profile",
    href: "/profile" as const,
    icon: User,
    description: "Personal stats & records"
  }
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/ace_logo.png"
              alt="ACE Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/images/ace_logo.png"
                      alt="ACE Logo"
                      width={24}
                      height={24}
                      className="h-6 w-auto"
                      priority
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">
                        {user?.first_name || 'User'}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Footer */}
                <div className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setIsOpen(false)
                      signOut()
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 