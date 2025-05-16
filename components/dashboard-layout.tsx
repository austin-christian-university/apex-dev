"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  CreditCard,
  Home,
  LogOut,
  Settings,
  User,
  Menu,
  ChevronRight,
  Bell,
  Search,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useUserRole } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const userRole = useUserRole()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
      roles: ["admin", "leader", "student"],
    },
    {
      name: "Student Profile",
      href: "/dashboard/student-profile",
      icon: User,
      current: pathname === "/dashboard/student-profile",
      roles: ["admin", "student"],
    },
    {
      name: "Course Records",
      href: "/dashboard/course-records",
      icon: BookOpen,
      current: pathname === "/dashboard/course-records",
      roles: ["admin", "student"],
    },
    {
      name: "Financial Overview",
      href: "/dashboard/financial-overview",
      icon: CreditCard,
      current: pathname === "/dashboard/financial-overview",
      roles: ["admin", "student"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
      roles: ["admin", "student"],
    },
  ]

  // Filter navigation items based on user role
  let filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))
  console.log(filteredNavigation)
  console.log(userRole)
  if (userRole === "leader") {
    filteredNavigation = navigation.filter((item) => item.name === "Dashboard")
  }

  // Get user name based on role
  const getUserName = () => {
    switch (userRole) {
      case "admin":
        return "Administrator"
      case "leader":
        return "Student Leader"
      case "student":
        return "John Doe"
      default:
        return "User"
    }
  }

  // Get user email based on role
  const getUserEmail = () => {
    switch (userRole) {
      case "admin":
        return "admin@acu.edu"
      case "leader":
        return "leader@acu.edu"
      case "student":
        return "student@acu.edu"
      default:
        return "user@acu.edu"
    }
  }

  // Get avatar fallback based on user role
  const getAvatarFallback = () => {
    switch (userRole) {
      case "admin":
        return "AD"
      case "leader":
        return "SL"
      case "student":
        return "JD"
      default:
        return "U"
    }
  }

  // Get avatar image based on role
  const getAvatarImage = () => {
    const seed = userRole === "student" ? "John Doe" : userRole
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Mobile menu */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6 bg-primary text-white dark:bg-primary/80">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">ACU</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Austin Christian University</p>
                  <p className="text-sm text-primary-100">Student Portfolio Dashboard</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-2 py-4 bg-background">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("nav-item my-1", item.current ? "nav-item-active" : "nav-item-inactive")}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-border">
                <Link href="/" className="nav-item nav-item-inactive">
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-card shadow-sm transition-colors duration-300">
          <div className="flex flex-shrink-0 items-center px-4 py-5 h-16 border-b border-border">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">ACU</span>
            </div>
            <div className="ml-3">
              <p className="font-semibold text-primary">Austin Christian</p>
              <p className="text-xs text-muted-foreground">University</p>
            </div>
          </div>
          <div className="flex flex-col overflow-y-auto pt-5 pb-4 flex-1">
            <nav className="mt-1 flex-1 space-y-1 px-3">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("nav-item", item.current ? "nav-item-active" : "nav-item-inactive")}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      item.current ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{item.name}</span>
                  {item.current && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-border p-4">
            <div className="flex items-center w-full">
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src={getAvatarImage()} alt="User avatar" />
                <AvatarFallback className="bg-primary/10 text-primary">{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{getUserName()}</p>
                <p className="text-xs text-muted-foreground">{getUserEmail()}</p>
                <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-primary">
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top navigation bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 transition-colors duration-300">
          <div className="md:hidden">
            {/* Spacer for mobile menu button */}
            <div className="w-6"></div>
          </div>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <div className="hidden md:flex md:items-center md:gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 rounded-full bg-background pl-8 md:w-80 lg:w-96"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white">
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-auto">
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="font-medium">Four Pillars Index Updated</div>
                      <div className="text-sm text-muted-foreground">Your Excellence score has been updated.</div>
                      <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="font-medium">New Course Added</div>
                      <div className="text-sm text-muted-foreground">BIB301 has been added to your schedule.</div>
                      <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="font-medium">Tuition Payment Reminder</div>
                      <div className="text-sm text-muted-foreground">Your next payment is due in 7 days.</div>
                      <div className="text-xs text-muted-foreground mt-1">2 days ago</div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex justify-center text-primary cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={getAvatarImage()} alt="User avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getAvatarFallback()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/" className="flex w-full">
                      Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8 animate-fade-in">{children}</div>
        </main>

        <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Austin Christian University. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
