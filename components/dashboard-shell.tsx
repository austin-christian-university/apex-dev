"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Calendar, CreditCard, LayoutDashboard, LogOut, Settings, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import type { Student, Admin } from "@/lib/data"

// Add type for user data
type UserData = {
  type: "student" | "admin"
  user: Student | Admin
}

// Add type for navigation items
type NavigationItem = {
  name: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [userData, setUserData] = useState<UserData | null>(null)

  // Handle mounting and load user data
  useEffect(() => {
    setMounted(true)
    
    // Get user data from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserData = localStorage.getItem("userData")
    
    if (!storedUserType || !storedUserData) {
      // If no user data, redirect to login
      router.push("/")
      return
    }

    try {
      const userType = storedUserType as "student" | "admin"
      const user = JSON.parse(storedUserData) as Student | Admin
      setUserData({ type: userType, user })
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/")
    }
  }, [router])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userData")
    router.push("/")
  }

  // Get user name from user data
  const getUserName = () => {
    return userData?.user.name || "User"
  }

  // Get user email from user data
  const getUserEmail = () => {
    return userData?.user.email || "user@acu.edu"
  }

  // Get avatar fallback based on user name
  const getAvatarFallback = () => {
    if (!userData?.user.name) return "U"
    return userData.user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
  }

  // Get avatar image based on user data
  const getAvatarImage = () => {
    if (userData?.user.avatarUrl) {
      return userData.user.avatarUrl
    }
    // Fallback to DiceBear with initials
    const initials = getAvatarFallback()
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=random&textColor=fff&fontSize=50`
  }

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/students", icon: Users},
    { name: "My Profile", href: "/my-profile", icon: User },
  ]

  // Filter navigation based on user type
  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly) {
      return userData?.type === "admin"
    }
    return true
  })

  // Update logo based on theme
  const logoSrc = mounted && theme === "dark" ? "/acu-logo-white.png" : "/acu-logo-bronze.png"

  // If not mounted or no user data, show loading state
  if (!mounted || !userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isCollapsed} onOpenChange={setIsCollapsed}>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <Image
                src={logoSrc}
                alt="Austin Christian University"
                width={40}
                height={40}
                className="w-40"
              />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.href} 
                        tooltip={item.name}
                        onClick={() => setIsCollapsed(true)} // Close sidebar after navigation
                      >
                        <Link href={item.href}>
                          <item.icon className="h-7 w-7" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto">
            <div className="flex justify-end px-4 py-4">
              <ThemeToggle />
            </div>
            <SidebarFooter className="border-t border-border/50">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarImage()} alt="User avatar" />
                      <AvatarFallback className="text-lg">{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base md:text-lg font-medium">{getUserName()}</p>
                      <p className="text-sm md:text-base text-muted-foreground">{getUserEmail()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10" 
                    onClick={handleLogout}
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-20 items-center gap-6 border-b bg-background px-4 sm:px-6 lg:px-8">
            {/* Only show sidebar trigger on mobile */}
            <div className="md:hidden">
              <SidebarTrigger className="h-14 w-14" />
            </div>
            <div className="flex-1" />
          </header>

          <main className="flex-1 overflow-x-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 