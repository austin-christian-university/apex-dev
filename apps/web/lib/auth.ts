"use client"

import { useEffect, useState } from "react"

// User roles
export type UserRole = "admin" | "leader" | "student"

// Hook to get the current user role
export function useUserRole(): UserRole {
  const [role, setRole] = useState<UserRole>("admin")

  useEffect(() => {
    // In a real app, this would come from an auth context or API
    const storedRole = localStorage.getItem("userRole") as UserRole
    if (storedRole) {
      setRole(storedRole)
    }
  }, [])

  return role
}

// Hook to check if user has permission for an action
export function useHasPermission(requiredRoles: UserRole[]): boolean {
  const userRole = useUserRole()
  return requiredRoles.includes(userRole)
}
