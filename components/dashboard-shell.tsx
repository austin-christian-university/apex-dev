"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Calendar, CreditCard, LayoutDashboard, LogOut, Settings, User } from "lucide-react"
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
import { useUserRole } from "@/lib/auth"
import { useTheme } from "next-themes"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const userRole = useUserRole()
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Get user name based on role
  const getUserName = () => {
    switch (userRole) {
      case "admin":
        return "Administrator"
      case "leader":
        return "Student Leader"
      case "student":
        return "Emma Johnson"
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
        return "emma.johnson@acu.edu"
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

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Student Profile", href: "/my-profile", icon: User },
    { name: "Course Records", href: "/course-records", icon: BookOpen },
    { name: "Financial Overview", href: "/financial-overview", icon: CreditCard },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Only show Dashboard for student leader
  const filteredNavigation = userRole === "leader"
    ? navigation.filter((item) => item.name === "Dashboard")
    : navigation

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update logo based on theme
  const logoSrc = mounted && theme === "dark" ? "/acu-logo-white.png" : "/acu-logo-bronze.png"

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
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
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

          <SidebarFooter className="border-t border-border p-4">
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
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href="/">
                  <LogOut className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-20 items-center gap-6 border-b bg-background px-8">
            <SidebarTrigger className="h-14 w-14" />
            <div className="flex-1" />
            <ThemeToggle />
          </header>

          <main className="flex-1 p-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 