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
    initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)
      try {
        if (session?.user) {
          console.log("Session exists, fetching profile for:", session.user.id)
          await fetchUserProfile(session.user.id)
          setIsAuthenticated(true)
        } else {
          console.log("No session, clearing user")
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

  const initializeSession = async () => {
    try {
      console.log("Initializing session...")
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log("Auth user:", authUser?.id)

      if (authUser) {
        console.log("Auth user found, fetching profile...")
        await fetchUserProfile(authUser.id)
        setIsAuthenticated(true)
      } else {
        console.log("No auth user found")
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error initializing session:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      let { data, error } = await supabase
        .from("users")
        .select("id, auth_user_id, email, full_name, phone, role")
        .eq("auth_user_id", userId)
        .single()

      if (error) {
        console.error("Database error fetching user profile:", {
          code: error.code,
          message: error.message,
          details: error.details,
        })
        // Try to create user record if it doesn't exist (registration race condition)
        console.log("Attempting to create user record...")
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user?.email) {
          // Generate username same way as registration page
          const name = authUser.user.user_metadata?.full_name || authUser.user.email
          const source = (name.split("@")[0] || "usuario").toLowerCase()
          const base = source.replace(/[^a-z0-9]+/g, "").slice(0, 18) || "usuario"
          const username = `${base}${Math.floor(Math.random() * 10000)}`

          const { error: insertError } = await supabase
            .from("users")
            .insert({
              auth_user_id: userId,
              username,
              email: authUser.user.email,
              full_name: name,
              role: "buyer",
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error creating user record:", insertError)
            throw insertError
          }

          // Retry fetching the profile
          const { data: newData, error: retryError } = await supabase
            .from("users")
            .select("id, auth_user_id, email, full_name, phone, role")
            .eq("auth_user_id", userId)
            .single()

          if (retryError) {
            console.error("Error on retry:", retryError)
            throw retryError
          }

          data = newData
        } else {
          throw error
        }
      }

      console.log("User profile fetched successfully:", data)

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
      console.log("User set in context:", normalizedUser)
    } catch (error) {
      console.error("Fatal error in fetchUserProfile:", error)
      setUser(null)
      setIsAuthenticated(false)
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
