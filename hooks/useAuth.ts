import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  nombre: string
  user_type: "usuario" | "vendedor"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        await fetchUserProfile(sessionData.session.user.id)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, nombre, user_type")
        .eq("id", userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await fetchUserProfile(data.user.id)
        setIsAuthenticated(true)
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}
