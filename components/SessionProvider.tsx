"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  auth_user_id: string
  email: string
  nombre: string
  telefono?: string
  role: "buyer" | "seller" | "admin"
  user_type: "usuario" | "vendedor" | "admin"
}

interface SessionContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        await fetchUserProfile(sessionData.session.user.id)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, auth_user_id, email, full_name, phone, role")
        .eq("auth_user_id", userId)
        .single()

      if (error) throw error

      const normalizedUser: User = {
        id: data.id,
        auth_user_id: data.auth_user_id,
        email: data.email,
        nombre: data.full_name || data.email,
        telefono: data.phone || "",
        role: data.role,
        user_type:
          data.role === "seller"
            ? "vendedor"
            : data.role === "admin"
              ? "admin"
              : "usuario",
      }

      setUser(normalizedUser)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, isAuthenticated, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}
